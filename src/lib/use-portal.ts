import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { selfHealPortalLink } from "@/lib/portal.functions";

export interface PortalClient {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  active: boolean;
  avatar_url?: string | null;
  am_id?: string | null;
}

export function usePortalClient() {
  const [client, setClient] = useState<PortalClient | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const heal = useServerFn(selfHealPortalLink);

  const refresh = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setClient(null);
      setEmail(null);
      setLoading(false);
      return;
    }
    setEmail(auth.user.email ?? null);

    // Call the SECURITY DEFINER function — matches by user_id OR heals by email.
    // This bypasses RLS entirely so a NULL user_id never blocks access.
    const { data: rows } = await supabase.rpc("get_my_portal_client");
    const row = rows?.[0] ?? null;

    setClient((row as PortalClient) ?? null);
    setLoading(false);

    // If the function healed the link, also run the server-side heal so
    // activity log is written (best-effort, ignore errors).
    if (row && !row.user_id) {
      heal().catch(() => {});
    }
  }, [heal]);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  return { client, email, loading, refresh };
}

/** Generic table reader scoped by RLS to the signed-in client. */
export function usePortalRows<T = Record<string, unknown>>(
  table: string,
  clientId: string | undefined,
  opts?: { orderBy?: string; ascending?: boolean; select?: string },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabase.from as any)(table).select(opts?.select ?? "*").eq("client_id", clientId);
    if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? false });
    const { data } = await q;
    setRows((data as T[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, clientId, opts?.orderBy, opts?.ascending, opts?.select]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, reload: load };
}
