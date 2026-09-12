import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

function decodeJwsPayload<T = any>(jws: string): T | null {
  try {
    const part = jws.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    return JSON.parse(atob(b64 + pad));
  } catch {
    return null;
  }
}

const GRANTS_ACCESS = new Set(["SUBSCRIBED", "DID_RENEW", "OFFER_REDEEMED", "DID_CHANGE_RENEWAL_PREF"]);
const REVOKES_ACCESS = new Set(["EXPIRED", "REFUND", "REVOKE", "GRACE_PERIOD_EXPIRED"]);

export default async function (req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const body = await req.json().catch(() => null);
    const signedPayload: string | undefined = body?.signedPayload;
    if (!signedPayload) return Response.json({ error: "signedPayload missing" }, { status: 400 });

    const payload = decodeJwsPayload(signedPayload);
    if (!payload) return Response.json({ error: "invalid signedPayload" }, { status: 400 });

    const notificationType: string = payload.notificationType ?? "";
    const subtype: string | undefined = payload.subtype;
    const tx = payload?.data?.signedTransactionInfo ? decodeJwsPayload(payload.data.signedTransactionInfo) : null;
    const renewal = payload?.data?.signedRenewalInfo ? decodeJwsPayload(payload.data.signedRenewalInfo) : null;
    const originalTransactionId: string | undefined =
      tx?.originalTransactionId ?? renewal?.originalTransactionId;

    if (!originalTransactionId) {
      console.log("apple-notification without transaction:", notificationType, subtype);
      return Response.json({ ok: true, notificationType, subtype });
    }

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    const profiles = await db.entities.UserProfile.filter(
      { subscription_original_transaction_id: originalTransactionId }, "-created_date", 1,
    );
    const profile = profiles?.[0];
    if (!profile) {
      console.warn("profile not found for", originalTransactionId, notificationType);
      return Response.json({ ok: true, unmatched: true });
    }

    const expiresMs = Number(tx?.expiresDate ?? 0);
    const expiresAt = Number.isFinite(expiresMs) && expiresMs > 0
      ? new Date(expiresMs).toISOString() : null;

    let status: string | null = null;
    if (REVOKES_ACCESS.has(notificationType)) status = "expired";
    else if (GRANTS_ACCESS.has(notificationType)) status = "active";
    else if (notificationType === "DID_FAIL_TO_RENEW") {
      status = subtype === "GRACE_PERIOD" ? "active" : "expired";
    } else if (notificationType === "DID_CHANGE_RENEWAL_STATUS") {
      status = expiresAt && new Date(expiresAt).getTime() > Date.now() ? "active" : "expired";
    }

    if (status) {
      await db.entities.UserProfile.update(profile.id, {
        subscription_status: status,
        subscription_expires_at: expiresAt,
        subscription_last_notification: `${notificationType}${subtype ? `:${subtype}` : ""}`,
      });
    }

    return Response.json({ ok: true, notificationType, subtype, status });
  } catch (e) {
    console.error("apple-server-notifications failed", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}