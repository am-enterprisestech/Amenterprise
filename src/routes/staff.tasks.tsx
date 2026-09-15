import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StaffShell, StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — AYMOXI Team Portal" },
      { name: "description", content: "Every task assigned to you, with status, priority and due dates." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="tasks">{(staff) => <Tasks staffId={staff.id} />}</StaffShell>,
});

interface Task { id: string; title: string; description: string | null; status: string; priority: string; progress: number; due_date: string | null }

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Completed" },
];

function Tasks({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffRows<Task>("staff_tasks", staffId, { orderBy: "created_at" });
  const [view, setView] = useState<"board" | "list">("board");

  async function move(task: Task, status: string) {
    await supabase.from("staff_tasks").update({ status, progress: status === "done" ? 100 : task.progress }).eq("id", task.id);
    reload();
  }

  return (
    <div>
      <StaffHeading
        title="My tasks"
        subtitle={`${rows.filter((t) => t.status !== "done").length} open of ${rows.length}`}
        right={
          <div className="inline-flex rounded-full border border-border p-1">
            {(["board", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{v}</button>
            ))}
          </div>
        }
      />

      {loading ? <StaffEmpty label="Loading tasks…" /> : rows.length === 0 ? <StaffEmpty label="No tasks assigned yet." /> : view === "board" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((c) => {
            const items = rows.filter((t) => (t.status || "todo") === c.key);
            return (
              <div key={c.key} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-foreground">{c.label}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((t) => (
                    <div key={t.id} className="rounded-xl border border-border bg-background p-3">
                      <p className="text-sm font-semibold text-foreground">{t.title}</p>
                      {t.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{t.priority}</span>
                        {t.due_date && <span className="text-[10px] text-muted-foreground">{new Date(t.due_date).toLocaleDateString()}</span>}
                      </div>
                      <select value={t.status} onChange={(e) => move(t, e.target.value)}
                        className="mt-3 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground">
                        {COLUMNS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>
                  ))}
                  {items.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">Nothing here</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Due</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-semibold text-foreground">{t.title}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{t.status.replace("_", " ")}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{t.priority}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
