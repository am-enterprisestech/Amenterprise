/**
 * Ultra-light PostgREST reader/writer for public (anon) traffic.
 *
 * The full supabase-js SDK pulls in auth + realtime + storage (~150 kB gzip)
 * which the public marketing site never needs. Auth and the admin panel keep
 * using the generated supabase client; everything public goes through here.
 */

const BASE = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function headers(extra?: Record<string, string>): Record<string, string> {
  return { apikey: KEY, "content-type": "application/json", ...extra };
}

export type SelectOptions = {
  select?: string;
  /** Equality filters, e.g. { published: true, slug: "abc" } */
  eq?: Record<string, string | number | boolean>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
};

function buildUrl(table: string, opts: SelectOptions): string {
  const params = new URLSearchParams();
  params.set("select", opts.select ?? "*");
  for (const [k, v] of Object.entries(opts.eq ?? {})) params.set(k, `eq.${v}`);
  if (opts.order) params.set("order", `${opts.order.column}.${opts.order.ascending === false ? "desc" : "asc"}`);
  if (opts.limit) params.set("limit", String(opts.limit));
  return `${BASE}/rest/v1/${table}?${params.toString()}`;
}

/** Select rows. Never throws — returns [] on failure so SSR can't crash. */
export async function dbSelect<T>(table: string, opts: SelectOptions = {}): Promise<T[]> {
  try {
    const res = await fetch(buildUrl(table, opts), { headers: headers() });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

/** Select a single row (or null). */
export async function dbSelectOne<T>(table: string, opts: SelectOptions = {}): Promise<T | null> {
  const rows = await dbSelect<T>(table, { ...opts, limit: 1 });
  return rows[0] ?? null;
}

/** Insert a row. Returns an error message on failure, or null on success. */
export async function dbInsert(table: string, row: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/rest/v1/${table}`, {
      method: "POST",
      headers: headers({ Prefer: "return=minimal" }),
      body: JSON.stringify(row),
    });
    if (!res.ok) return (await res.text()) || `Request failed (${res.status})`;
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Network error";
  }
}
