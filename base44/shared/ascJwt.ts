import { secrets } from "base44:runtime";

// Base64url encode without padding (RFC 7515).
function b64url(input) {
  const buf = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  let str = "";
  for (let i = 0; i < buf.byteLength; i++) str += String.fromCharCode(buf[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlStr(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem) {
  // Support both full PEM (with -----BEGIN/END----- markers) and raw base64 DER.
  let stripped;
  if (/-----BEGIN/.test(pem)) {
    stripped = pem
      .replace(/-----BEGIN [A-Z ]+-----/, "")
      .replace(/-----END [A-Z ]+-----/, "")
      .replace(/\s+/g, "");
  } else {
    stripped = pem.replace(/\s+/g, "");
  }
  const bin = atob(stripped);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Builds and signs a short-lived (20 min) ES256 JWT for the App Store Connect API.
export async function buildAscToken(scopeMinutes = 19) {
  const keyId = secrets.get("APP_STORE_CONNECT_API_KEY_KEY_ID");
  const issuerId = secrets.get("APP_STORE_CONNECT_API_KEY_ISSUER_ID");
  const privateKeyPem = secrets.get("APP_STORE_CONNECT_API_KEY_KEY");
  if (!keyId || !issuerId || !privateKeyPem) {
    throw new Error(
      "Missing App Store Connect secrets (APP_STORE_CONNECT_API_KEY_KEY_ID / APP_STORE_CONNECT_API_KEY_ISSUER_ID / APP_STORE_CONNECT_API_KEY_KEY)."
    );
  }

  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat,
    exp: iat + scopeMinutes * 60,
    aud: "appstoreconnect-v1",
  };

  const signingInput =
    b64urlStr(JSON.stringify(header)) + "." + b64urlStr(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput)
  );

  return signingInput + "." + b64url(signature);
}