import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PortalClient {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  active: boolean;
}

export function usePortalClient() {
  const [client, setClient] = useState<PortalClient | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setClient(null);
      setEmail(null);
      setLoading(false);
      return;
    }
    setEmail(auth.user.email ?? null);
    const { data } = await supabase
      .from("portal_clients")
      .select("id, user_id, name, email, company, phone, active")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    setClient((data as PortalClient) ?? null);
    setLoading(false);
  }, []);

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
