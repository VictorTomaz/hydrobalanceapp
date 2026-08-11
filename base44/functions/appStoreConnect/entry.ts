import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildAscToken } from "../../shared/ascJwt.ts";

// Calls the App Store Connect API with a signed ES256 JWT.
// Payload: { path: "/v1/apps", method?: "GET", query?: "filter[platform]=IOS" }
// Defaults to listing the team's apps.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const path = body.path || "/v1/apps";
    const method = (body.method || "GET").toUpperCase();
    const query = body.query ? `?${body.query}` : "";

    // Allow only GET by default — writes require explicit opt-in.
    if (method !== "GET") {
      return Response.json({ error: `Unsupported method: ${method}` }, { status: 400 });
    }

    const token = await buildAscToken(19);

    // Temporary diagnostic: decode the (unsigned) JWT header + payload so the
    // caller can verify kid (Key ID), iss (Issuer ID), exp, and that the .p8
    // was imported as a usable ECDSA P-256 key. No secret material is revealed.
    if (body.debug) {
      const [h, p] = token.split(".");
      const decode = (s) => {
        const norm = s.replace(/-/g, "+").replace(/_/g, "/");
        const pad = norm + "=".repeat((4 - (norm.length % 4)) % 4);
        return JSON.parse(atob(pad));
      };
      return Response.json({
        header: decode(h),
        payload: decode(p),
        tokenLength: token.length,
      });
    }

    const url = `https://api.appstoreconnect.apple.com${path}${query}`;
    const upstream = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}