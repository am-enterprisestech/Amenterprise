import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { useState } from "react";

export const Route = createFileRoute("/clients/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks â€” AM Enterprises Client Portal" },
      { name: "description", content: "See every task on your projects, its owner, priority and due date." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Tasks clientId={client.id} />}</PortalShell>,
});

interface Task { id: string; title: string; description: string | null; status: string; priority: string; progress: number; assignee: string | null; due_date: string | null }

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Completed" },
];

function Tasks({ clientId }: { clientId: string }) {
  const { rows, loading } = usePortalRows<Task>("client_tasks", clientId, { orderBy: "created_at" });
  const [view, setView] = useState<"board" | "list">("board");

  return (
    <div>
      <PortalHeading
        title="Tasks"
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

      {loading ? <EmptyState label="Loading tasksâ€¦" /> : rows.length === 0 ? <EmptyState label="No tasks yet." /> : view === "board" ? (
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
                  {items.map((t) => <TaskCard key={t.id} task={t} />)}
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
                <tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Due</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-semibold text-foreground">{t.title}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{t.status.replace("_", " ")}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{t.priority}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assignee || "â€”"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "â€”"}</td>
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

function TaskCard({ task }: { task: Task }) {
  const tone = task.priority === "high" || task.priority === "urgent" ? "bg-destructive/10 text-destructive" : task.priority === "low" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary";
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-sm font-semibold text-foreground">{task.title}</p>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>{task.priority}</span>
        {task.assignee && <span className="text-[10px] font-semibold text-muted-foreground">{task.assignee}</span>}
        {task.due_date && <span className="ml-auto text-[10px] text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
      {task.progress > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, task.progress)}%` }} />
        </div>
      )}
    </div>
  );
}
