import { useEffect, useState } from "react";
import { dbSelect } from "@/lib/rest";

/**
 * Public-site list reader. Uses the lightweight REST client (no supabase-js in
 * the public bundle) and refreshes when the tab regains focus so admin edits
 * show up without a realtime websocket.
 */
export function useLiveList<T extends { id: string }>(
  table: string,
  opts: {
    orderBy?: { column: string; ascending?: boolean };
    filterPublished?: boolean;
    /** Explicit column list — use it to avoid selecting restricted columns. */
    select?: string;
  } = {},
) {
  const { orderBy, filterPublished = true, select } = opts;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await dbSelect<T>(table, {
        eq: filterPublished ? { published: true } : undefined,
        order: orderBy,
        select,
      });
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    }
    load();

    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { rows, loading };
}
