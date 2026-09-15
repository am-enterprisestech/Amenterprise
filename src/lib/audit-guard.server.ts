/**
 * SSRF protection for the public site-audit tool.
 *
 * Resolves the target hostname over DNS-over-HTTPS and rejects any address in a
 * private, loopback, link-local or otherwise reserved range before fetching.
 * Redirects are followed manually so every hop gets the same validation.
 */

const MAX_REDIRECTS = 3;

function ipv4IsBlocked(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = p as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function ipv6IsBlocked(ip: string): boolean {
  const v = ip.toLowerCase().trim();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
  if (v.startsWith("ff")) return true; // multicast
  if (v.startsWith("::ffff:")) {
    const mapped = v.slice(7);
    if (mapped.includes(".")) return ipv4IsBlocked(mapped);
    return true;
  }
  return false;
}

function hostLooksInternal(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".internal") || h.endsWith(".local") || h.endsWith(".home.arpa")) return true;
  if (h === "metadata.google.internal") return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return ipv4IsBlocked(h);
  if (h.includes(":")) return ipv6IsBlocked(h);
  return false;
}

async function resolve(host: string, type: "A" | "AAAA"): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { Answer?: { type: number; data: string }[] };
    return (json.Answer ?? [])
      .filter((a) => a.type === (type === "A" ? 1 : 28))
      .map((a) => a.data);
  } catch {
    return [];
  }
}

/** Throws when the URL must not be fetched from our servers. */
export async function assertPublicTarget(url: URL): Promise<void> {
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("blocked");
  if (url.port && !["", "80", "443", "8080", "8443"].includes(url.port)) throw new Error("blocked");
  if (hostLooksInternal(url.hostname)) throw new Error("blocked");

  const literal = /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.includes(":");
  if (literal) return; // already validated above

  const [v4, v6] = await Promise.all([resolve(url.hostname, "A"), resolve(url.hostname, "AAAA")]);
  const addrs = [...v4, ...v6];
  if (addrs.length === 0) throw new Error("blocked");
  for (const ip of addrs) {
    if (ip.includes(":") ? ipv6IsBlocked(ip) : ipv4IsBlocked(ip)) throw new Error("blocked");
  }
}

/** Fetches a URL, validating every redirect hop against the SSRF rules. */
export async function safeFetch(target: URL, init: RequestInit): Promise<Response> {
  let current = target;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicTarget(current);
    const res = await fetch(current.toString(), { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      current = new URL(loc, current);
      continue;
    }
    return res;
  }
  throw new Error("blocked");
}
