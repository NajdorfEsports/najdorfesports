// Shared networking helpers for the data-fetch scripts. Centralizes the
// descriptive User-Agent (the default fetch UA is blocked by Liquipedia and
// some social endpoints), the rate-limit sleep, and gzip-aware fetch wrappers.

/** Descriptive UA with site + contact, per Liquipedia ToS. */
export const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET JSON with the descriptive UA + gzip. Throws on a non-2xx response. */
export async function fetchJson(url, { userAgent = USER_AGENT, headers = {} } = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept-Encoding': 'gzip',
      Accept: 'application/json',
      ...headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** GET binary (an image) with the UA + gzip. Returns a Buffer. */
export async function fetchBuffer(url, { userAgent = USER_AGENT } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent, 'Accept-Encoding': 'gzip' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
