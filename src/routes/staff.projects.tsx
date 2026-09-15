import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffShell, StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff/projects")({
  head: () => ({
    meta: [
      { title: "Projects — AYMOXI Team Portal" },
      { name: "description", content: "The projects you are assigned to, with live progress and deadlines." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="projects">{() => <Projects />}</StaffShell>,
});

interface Project { id: string; title: string; service: string | null; status: string; progress: number; start_date: string | null; due_date: string | null; summary: string | null }

function Projects() {
  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, service, status, progress, start_date, due_date, summary")
        .order("created_at", { ascending: false });
      setRows((data as Project[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <StaffHeading title="Projects" subtitle={`${rows.filter((p) => p.status !== "completed").length} active of ${rows.length}`} />
      {loading ? <StaffEmpty label="Loading projects…" /> : rows.length === 0 ? <StaffEmpty label="You're not assigned to any project yet." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-black text-foreground">{p.title}</h2>
                  {p.service && <p className="text-xs text-muted-foreground">{p.service}</p>}
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{p.status.replace("_", " ")}</span>
              </div>
              {p.summary && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {p.start_date ? `Started ${new Date(p.start_date).toLocaleDateString()}` : "Not started"}
                {p.due_date ? ` · Due ${new Date(p.due_date).toLocaleDateString()}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
