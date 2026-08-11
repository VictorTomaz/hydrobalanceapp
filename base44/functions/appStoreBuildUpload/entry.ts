import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildAscToken } from "../../shared/ascJwt.ts";
import { ascRequest } from "../../shared/ascClient.ts";

// Uploads an iOS .ipa to App Store Connect using the v1 build-upload flow:
//   1. POST /v1/buildUploads        — reserve a build upload under an app
//   2. POST /v1/buildUploadFiles    — register the .ipa, receive presigned upload operations
//   3. PUT each part to Apple's blobstore (presigned URLs — no JWT needed there)
//   4. PATCH /v1/buildUploadFiles/{id} { uploaded: true } — commit the file
//
// After commit, App Store Connect processes the build asynchronously (PROCESSING -> COMPLETE).
// Use a BUILD_UPLOAD_STATE_UPDATED webhook (or GET /v1/buildUploads/{id}) to track completion.
//
// Payload:
//   appId              — App Store Connect app id (numeric string; find it via appStoreConnect /v1/apps)
//   bundleShortVersion — e.g. "1.4.3"  (cfBundleShortVersionString)
//   bundleVersion      — optional e.g. "119" (cfBundleVersion). Omit to auto-
//                        generate a unique increasing number from the timestamp
//                        (avoids "Version code has already been used" on re-uploads).
//   fileName           — e.g. "HydroBalance.ipa"
//   fileUrl            — URL where this function can fetch the .ipa bytes
//                       (use UploadPrivateFile + CreateFileSignedUrl, or any reachable URL)
//   platform           — optional, default "IOS"
//
// Note: requires the ASC_KEY_ID / ASC_ISSUER_ID / ASC_PRIVATE_KEY secrets to be a valid
// registered match at Apple (the same JWT used by appStoreConnect). Until that 401 is resolved
// upstream, no build-upload call will succeed.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      appId,
      bundleShortVersion,
      bundleVersion: explicitBundleVersion,
      fileName,
      fileUrl,
      platform = "IOS",
    } = body;

    // Auto-generate a unique, increasing build number from the current Unix
    // timestamp when none is provided, so the same app version can be
    // re-uploaded without hitting "Version code X has already been used".
    const bundleVersion = explicitBundleVersion || String(Math.floor(Date.now() / 1000));

    if (!appId || !bundleShortVersion || !fileName || !fileUrl) {
      return Response.json(
        {
          error:
            "Missing required fields: appId, bundleShortVersion, fileName, fileUrl",
        },
        { status: 400 }
      );
    }

    const token = await buildAscToken(19);

    // 1. Reserve the build upload under the app.
    const createRes = await ascRequest(token, "POST", "/v1/buildUploads", {
      data: {
        type: "buildUploads",
        attributes: {
          cfBundleShortVersionString: bundleShortVersion,
          cfBundleVersion: bundleVersion,
          platform,
        },
        relationships: {
          app: { data: { type: "apps", id: appId } },
        },
      },
    });
    if (createRes.status !== 201) {
      return Response.json(
        { error: "Failed to create build upload", status: createRes.status, detail: createRes.data },
        { status: 502 }
      );
    }
    const buildUploadId = createRes.data?.data?.id;
    if (!buildUploadId) {
      return Response.json(
        { error: "buildUpload id missing in response", detail: createRes.data },
        { status: 502 }
      );
    }

    // 2. Fetch the .ipa so we know its size, then register it to get the upload operations.
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return Response.json(
        { error: `Failed to fetch .ipa from fileUrl (status ${fileRes.status})` },
        { status: 502 }
      );
    }
    const fileBuf = new Uint8Array(await fileRes.arrayBuffer());
    const fileSize = fileBuf.byteLength;

    const fileCreateRes = await ascRequest(token, "POST", "/v1/buildUploadFiles", {
      data: {
        type: "buildUploadFiles",
        attributes: {
          fileName,
          fileSize,
          assetType: "ASSET",
          uti: "com.apple.ipa",
        },
        relationships: {
          buildUpload: { data: { type: "buildUploads", id: buildUploadId } },
        },
      },
    });
    if (fileCreateRes.status !== 201) {
      return Response.json(
        {
          error: "Failed to create buildUploadFile",
          status: fileCreateRes.status,
          detail: fileCreateRes.data,
        },
        { status: 502 }
      );
    }
    const fileId = fileCreateRes.data?.data?.id;
    const fileAttrs = fileCreateRes.data?.data?.attributes || {};
    const uploadOperations: any[] = fileAttrs.uploadOperations || [];
    if (!fileId || !uploadOperations.length) {
      return Response.json(
        { error: "No upload operations returned", detail: fileCreateRes.data },
        { status: 502 }
      );
    }

    // 3. PUT each part to Apple's blobstore using the presigned URL + required headers.
    for (const op of uploadOperations) {
      const offset = op.offset || 0;
      const length = op.length;
      const chunk = fileBuf.subarray(offset, offset + length);
      const headers: Record<string, string> = {};
      for (const h of op.requestHeaders || []) headers[h.name] = h.value;
      const putRes = await fetch(op.url, {
        method: op.method || "PUT",
        headers,
        body: chunk,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        return Response.json(
          {
            error: `Upload part failed at offset ${offset}`,
            status: putRes.status,
            detail: errText.slice(0, 500),
          },
          { status: 502 }
        );
      }
    }

    // 4. Commit the buildUploadFile so App Store Connect starts processing the build.
    const commitRes = await ascRequest(token, "PATCH", `/v1/buildUploadFiles/${fileId}`, {
      data: {
        id: fileId,
        type: "buildUploadFiles",
        attributes: { uploaded: true },
      },
    });
    if (commitRes.status !== 200) {
      return Response.json(
        {
          error: "Failed to commit buildUploadFile",
          status: commitRes.status,
          detail: commitRes.data,
        },
        { status: 502 }
      );
    }

    return Response.json({
      buildUploadId,
      buildUploadFileId: fileId,
      fileName,
      fileSize,
      partCount: uploadOperations.length,
      commit: commitRes.data?.data || commitRes.data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}