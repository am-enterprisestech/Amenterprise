import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  job_title: string | null;
  role: string;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  modules: string[];
  active: boolean;
}

export function useStaffMember() {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setStaff(null);
      setEmail(null);
      setLoading(false);
      return;
    }
    setEmail(auth.user.email ?? null);
    const { data } = await supabase
      .from("staff_members")
      .select("id, user_id, name, email, job_title, role, department, phone, avatar_url, modules, active")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    setStaff((data as StaffMember) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  return { staff, email, loading, refresh };
}

/** Reads a staff-scoped table; RLS limits rows to the signed-in team member. */
export function useStaffRows<T = Record<string, unknown>>(
  table: string,
  staffId: string | undefined,
  opts?: { orderBy?: string; ascending?: boolean; select?: string },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabase.from as any)(table).select(opts?.select ?? "*").eq("staff_id", staffId);
    if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? false });
    const { data } = await q;
    setRows((data as T[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, staffId, opts?.orderBy, opts?.ascending, opts?.select]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, reload: load };
}
