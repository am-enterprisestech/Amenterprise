import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectRow {
  id: string;
  title: string;
  service: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  summary: string | null;
  client_id: string | null;
  repo_url: string | null;
  staging_url: string | null;
  live_url: string | null;
}

/** Projects the signed-in team member is actually assigned to (database driven). */
export function useMyProjects(staffId?: string) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    const { data } = await supabase
      .from("project_assignments")
      .select("role_on_project, projects(id, title, service, status, progress, start_date, due_date, summary, client_id, repo_url, staging_url, live_url)")
      .eq("staff_id", staffId);
    const rows = (data ?? [])
      .map((r) => (r as unknown as { projects: ProjectRow | null }).projects)
      .filter(Boolean) as ProjectRow[];
    setProjects(rows);
    setLoading(false);
  }, [staffId]);

  useEffect(() => { load(); }, [load]);

  return { projects, loading, reload: load, projectIds: projects.map((p) => p.id) };
}

/** Reads any department table scoped to the projects the member is assigned to. */
export function useProjectScopedRows<T = Record<string, unknown>>(
  table: string,
  projectIds: string[],
  opts?: { orderBy?: string; ascending?: boolean; select?: string },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const key = projectIds.slice().sort().join(",");

  const load = useCallback(async () => {
    if (!key) { setRows([]); setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabase.from as any)(table).select(opts?.select ?? "*").in("project_id", key.split(","));
    q = q.order(opts?.orderBy ?? "created_at", { ascending: opts?.ascending ?? false });
    const { data } = await q;
    setRows((data as T[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, key, opts?.orderBy, opts?.ascending, opts?.select]);

  useEffect(() => { load(); }, [load]);

  return { rows, loading, reload: load };
}

export async function insertRow(table: string, values: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).insert(values);
  if (error) throw new Error(error.message);
}

export async function updateRow(table: string, id: string, values: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRow(table: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
