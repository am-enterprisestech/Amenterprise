import { ProjectConnections } from "@/components/portal/ProjectConnections";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  CalendarDays, CheckCircle2, Clock, Loader2, FolderKanban,
  Milestone, Globe, Github, ExternalLink, ChevronDown, ChevronUp, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/clients/projects")({
  head: () => ({
    meta: [
      { title: "My Projects — AM Enterprises Client Portal" },
      { name: "description", content: "Track project status, timeline and milestones." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Projects clientId={client.id} />}</PortalShell>,
});

interface Project { id: string; title: string; service: string | null; status: string; progress: number; start_date: string | null; due_date: string | null; summary: string | null; staging_url: string | null; live_url: string | null; repo_url: string | null }
interface MilestoneRow { id: string; project_id: string; title: string; description: string | null; status: string; due_date: string | null; sort_order: number }

const STATUS_META: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  planning:    { label: "Planning",    color: "text-blue-700",    bg: "bg-blue-50",    ring: "#3b82f6" },
  in_progress: { label: "In Progress", color: "text-indigo-700",  bg: "bg-indigo-50",  ring: "#6366f1" },
  review:      { label: "In Review",   color: "text-violet-700",  bg: "bg-violet-50",  ring: "#7c3aed" },
  completed:   { label: "Completed",   color: "text-emerald-700", bg: "bg-emerald-50", ring: "#10b981" },
  on_hold:     { label: "On Hold",     color: "text-amber-700",   bg: "bg-amber-50",   ring: "#f59e0b" },
  cancelled:   { label: "Cancelled",   color: "text-red-700",     bg: "bg-red-50",     ring: "#ef4444" },
};

function RingChart({ pct, ring, size = 56 }: { pct: number; ring: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} stroke="#e5e7eb" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} stroke={ring} fill="none"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

function Projects({ clientId }: { clientId: string }) {
  const { rows: projects, loading } = usePortalRows<Project>("projects", clientId, { orderBy: "created_at" });
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) return;
    supabase.from("project_milestones").select("*")
      .in("project_id", projects.map((p) => p.id))
      .order("sort_order", { ascending: true })
      .then(({ data }) => setMilestones((data as MilestoneRow[]) ?? []));
  }, [projects]);

  const active = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div>
      <PortalHeading
        title="My Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} · ${active.length} active`}
      />

      {/* Summary row */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {[
          { label: "Active", val: active.length, color: "from-indigo-500 to-indigo-700", icon: TrendingUp },
          { label: "Completed", val: completed.length, color: "from-emerald-500 to-teal-600", icon: CheckCircle2 },
          { label: "Total", val: projects.length, color: "from-slate-600 to-slate-800", icon: FolderKanban },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow`}>
            <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-white/10" />
            <Icon className="h-5 w-5 mb-2 opacity-80" />
            <p className="text-2xl font-black">{val}</p>
            <p className="text-xs font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted"><FolderKanban className="h-8 w-8 text-muted-foreground/50" /></div>
          <p className="font-display text-lg font-black text-foreground">No projects yet</p>
          <p className="text-sm text-muted-foreground">Projects assigned to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const ms = milestones.filter((m) => m.project_id === p.id);
            const meta = STATUS_META[p.status] ?? STATUS_META.in_progress;
            const pct = Math.min(100, Math.max(0, p.progress ?? 0));
            const isExpanded = expanded === p.id;
            const doneMilestones = ms.filter((m) => m.status === "done").length;

            return (
              <div key={p.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                {/* Project card header */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Ring progress */}
                    <div className="relative shrink-0">
                      <RingChart pct={pct} ring={meta.ring} size={64} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-foreground">{pct}%</span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-black text-foreground">{p.title}</h2>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${meta.bg} ${meta.color}`}>{meta.label}</span>
                        {p.service && <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground">{p.service}</span>}
                      </div>

                      {p.summary && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.summary}</p>}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: meta.ring }} />
                        </div>
                      </div>

                      {/* Dates + links */}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {p.start_date && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Started {new Date(p.start_date).toLocaleDateString()}</span>}
                        {p.due_date && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Due {new Date(p.due_date).toLocaleDateString()}</span>}
                        {ms.length > 0 && <span className="inline-flex items-center gap-1"><Milestone className="h-3.5 w-3.5" />{doneMilestones}/{ms.length} milestones</span>}
                      </div>

                      {/* External links */}
                      {(p.live_url || p.staging_url || p.repo_url) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"><Globe className="h-3 w-3" />Live site</a>}
                          {p.staging_url && <a href={p.staging_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100"><ExternalLink className="h-3 w-3" />Staging</a>}
                          {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold text-foreground hover:bg-muted/70"><Github className="h-3 w-3" />Repo</a>}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border hover:bg-muted transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: milestones + team */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-5 space-y-5">
                    <ProjectConnections projectId={p.id} showClient={false} />

                    {ms.length > 0 && (
                      <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                          <Milestone className="h-3.5 w-3.5" /> Milestones
                        </p>
                        <div className="space-y-2">
                          {ms.map((m, idx) => {
                            const done = m.status === "done";
                            const inProgress = m.status === "in_progress";
                            return (
                              <div key={m.id} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 ${done ? "bg-emerald-500 border-emerald-500" : inProgress ? "bg-amber-400 border-amber-400" : "bg-card border-muted-foreground/30"}`}>
                                    {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    {inProgress && <Loader2 className="h-3 w-3 text-white animate-spin" />}
                                  </div>
                                  {idx < ms.length - 1 && <div className="w-0.5 flex-1 bg-muted mt-1 min-h-4" />}
                                </div>
                                <div className="min-w-0 pb-3">
                                  <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.title}</p>
                                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                                  {m.due_date && <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{new Date(m.due_date).toLocaleDateString()}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
