import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CalendarDays, Milestone } from "lucide-react";

export const Route = createFileRoute("/clients/projects")({
  head: () => ({
    meta: [
      { title: "My Projects â€” AM Enterprises Client Portal" },
      { name: "description", content: "Track the status, timeline and milestones of every project AM Enterprises is delivering for you." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Projects clientId={client.id} />}</PortalShell>,
});

interface Project { id: string; title: string; service: string | null; status: string; progress: number; start_date: string | null; due_date: string | null; summary: string | null }
interface Milestone { id: string; project_id: string; title: string; description: string | null; status: string; due_date: string | null; sort_order: number }

function Projects({ clientId }: { clientId: string }) {
  const { rows: projects, loading } = usePortalRows<Project>("projects", clientId, { orderBy: "created_at" });
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (projects.length === 0) return;
    supabase
      .from("project_milestones")
      .select("*")
      .in("project_id", projects.map((p) => p.id))
      .order("sort_order", { ascending: true })
      .then(({ data }) => setMilestones((data as Milestone[]) ?? []));
  }, [projects]);

  return (
    <div>
      <PortalHeading title="My projects" subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} on your account`} />
      {loading ? <EmptyState label="Loading projectsâ€¦" /> : projects.length === 0 ? <EmptyState label="No projects assigned yet." /> : (
        <div className="space-y-5">
          {projects.map((p) => {
            const ms = milestones.filter((m) => m.project_id === p.id);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-black text-foreground">{p.title}</h2>
                    {p.service && <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.service}</p>}
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">{p.status}</span>
                </div>
                {p.summary && <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>}

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {p.start_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Started {new Date(p.start_date).toLocaleDateString()}</span>}
                  {p.due_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Due {new Date(p.due_date).toLocaleDateString()}</span>}
                </div>

                {ms.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-foreground"><Milestone className="h-3.5 w-3.5" /> Milestones</p>
                    <ul className="space-y-2">
                      {ms.map((m) => (
                        <li key={m.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${m.status === "done" ? "bg-primary" : m.status === "in_progress" ? "bg-amber-500" : "bg-muted-foreground/40"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{m.title}</p>
                            {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                          </div>
                          {m.due_date && <span className="shrink-0 text-xs text-muted-foreground">{new Date(m.due_date).toLocaleDateString()}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
