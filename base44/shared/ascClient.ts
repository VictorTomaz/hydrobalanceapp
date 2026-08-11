// Minimal App Store Connect REST client used by backend functions.
// Parses Apple's rate-limit headers and surfaces/handles 429 responses.

const BASE = "https://api.appstoreconnect.apple.com";

export interface AscRateLimit {
  remaining: number | null;
  limit: number | null;
  resetEpoch: number | null;
}

export class AscRateLimitError extends Error {
  rateLimit: AscRateLimit;
  retryAfterSeconds: number | null;
  constructor(rateLimit: AscRateLimit, retryAfterSeconds: number | null) {
    const resetIso =
      rateLimit.resetEpoch != null
        ? new Date(rateLimit.resetEpoch * 1000).toISOString()
        : "unknown";
    super(
      `App Store Connect rate limit exceeded. Resets at ${resetIso}${
        retryAfterSeconds != null ? ` (retry after ${retryAfterSeconds}s)` : ""
      }.`
    );
    this.name = "AscRateLimitError";
    this.rateLimit = rateLimit;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Parses the X-Rate-Limit ("remaining of limit") and X-Rate-Limit-Reset (epoch seconds)
// headers Apple includes on every ASC REST response.
function parseRateLimit(res: Response): AscRateLimit {
  const raw = res.headers.get("x-rate-limit"); // e.g. "59 of 200"
  const resetRaw = res.headers.get("x-rate-limit-reset");
  let remaining: number | null = null;
  let limit: number | null = null;
  if (raw) {
    const m = raw.match(/(\d+)\s+of\s+(\d+)/i);
    if (m) {
      remaining = parseInt(m[1], 10);
      limit = parseInt(m[2], 10);
    }
  }
  const resetEpoch =
    resetRaw && /^\d+$/.test(resetRaw) ? parseInt(resetRaw, 10) : null;
  return { remaining, limit, resetEpoch };
}

async function doFetch(
  token: string,
  method: string,
  path: string,
  body: any
): Promise<Response> {
  return await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function ascRequest(
  token: string,
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any; rateLimit: AscRateLimit }> {
  let res = await doFetch(token, method, path, body);
  let rateLimit = parseRateLimit(res);

  // Apple returns 429 when the hourly bucket is exhausted. Honor Retry-After
  // (seconds) if present, otherwise wait until X-Rate-Limit-Reset, then retry once.
  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    let waitMs: number | null = null;
    if (retryAfter && /^\d+(\.\d+)?$/.test(retryAfter)) {
      waitMs = Math.ceil(parseFloat(retryAfter) * 1000);
    } else if (rateLimit.resetEpoch != null) {
      waitMs = Math.max(
        0,
        rateLimit.resetEpoch * 1000 - Date.now()
      );
    }
    // Cap the wait so a backend function doesn't stall past its own runtime.
    const cappedMs = waitMs != null ? Math.min(waitMs, 20000) : 1000;

    if (cappedMs > 0) await sleep(cappedMs);
    res = await doFetch(token, method, path, body);
    rateLimit = parseRateLimit(res);

    if (res.status === 429) {
      throw new AscRateLimitError(rateLimit, null);
    }
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  return { status: res.status, data, rateLimit };
}