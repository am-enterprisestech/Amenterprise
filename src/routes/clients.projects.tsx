import { ProjectConnections } from "@/components/portal/ProjectConnections";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  CalendarDays, CheckCircle2, Clock, Loader2, FolderKanban,
  Milestone, Globe, Github, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, PlusCircle, MessageSquare, Check, Sparkles, AlertCircle,
  Calendar, Download
} from "lucide-react";
import { ProjectRequestModal } from "@/components/portal/ProjectRequestModal";
import { downloadIcsFile } from "@/lib/calendar";

export const Route = createFileRoute("/clients/projects")({
  head: () => ({
    meta: [
      { title: "My Projects & Milestones — Veloura Apparel Client Portal" },
      { name: "description", content: "Track active project progress, approve milestones, view live builds and request new engineering sprints." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Projects clientId={client.id} clientName={client.name} />}</PortalShell>,
});

interface Project {
  id: string;
  title: string;
  service: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  summary: string | null;
  staging_url: string | null;
  live_url: string | null;
  repo_url: string | null;
}

interface MilestoneRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  sort_order: number;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  planning:    { label: "Planning",    color: "text-[#24262B]", bg: "bg-[#E5F3FA] border-[#85BBD6]/30", ring: "#85BBD6" },
  in_progress: { label: "In Progress", color: "text-[#24262B]", bg: "bg-[#F8E8EF] border-[#D9A7BC]/40", ring: "#D9A7BC" },
  review:      { label: "In Review",   color: "text-[#24262B]", bg: "bg-[#E5F3FA] border-[#85BBD6]/30", ring: "#85BBD6" },
  completed:   { label: "Completed",   color: "text-[#638D79]", bg: "bg-[#FAFAF8] border-[#638D79]/30", ring: "#638D79" },
  on_hold:     { label: "On Hold",     color: "text-[#85858D]", bg: "bg-[#FAFAF8] border-[#ECEBE8]",    ring: "#85858D" },
  cancelled:   { label: "Cancelled",   color: "text-[#85858D]", bg: "bg-[#FAFAF8] border-[#ECEBE8]",    ring: "#85858D" },
};

function RingChart({ pct, ring, size = 60 }: { pct: number; ring: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} stroke="#e5e7eb" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={7}
        stroke={ring}
        fill="none"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function Projects({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { rows: projects, loading, reload } = usePortalRows<Project>("projects", clientId, { orderBy: "created_at" });
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actingMilestoneId, setActingMilestoneId] = useState<string | null>(null);
  const [revisionMilestoneId, setRevisionMilestoneId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");

  useEffect(() => {
    if (projects.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("project_milestones")
      .select("*")
      .in("project_id", projects.map((p) => p.id))
      .order("sort_order", { ascending: true })
      .then(({ data }: { data: MilestoneRow[] | null }) => setMilestones(data ?? []));
  }, [projects]);

  function reloadMilestones() {
    if (projects.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("project_milestones")
      .select("*")
      .in("project_id", projects.map((p) => p.id))
      .order("sort_order", { ascending: true })
      .then(({ data }: { data: MilestoneRow[] | null }) => setMilestones(data ?? []));
  }

  // Interactive milestone approval
  async function handleApproveMilestone(m: MilestoneRow, project: Project) {
    setActingMilestoneId(m.id);
    try {
      // 1. Update milestone status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("project_milestones")
        .update({ status: "done" })
        .eq("id", m.id);

      // 2. Increment project progress if applicable
      const projMilestones = milestones.filter((x) => x.project_id === project.id);
      const doneCount = projMilestones.filter((x) => x.status === "done" || x.id === m.id).length;
      const newProgress = Math.min(100, Math.round((doneCount / Math.max(1, projMilestones.length)) * 100));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("projects")
        .update({ progress: newProgress })
        .eq("id", project.id);

      // 3. Log activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: clientId,
        action: "milestone_approved",
        description: `Approved milestone "${m.title}" for project "${project.title}"`,
      });

      reloadMilestones();
      reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActingMilestoneId(null);
    }
  }

  // Request change / revision on milestone
  async function submitRevision(m: MilestoneRow, project: Project) {
    if (!revisionNotes.trim()) return;
    setActingMilestoneId(m.id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("project_milestones")
        .update({ status: "in_progress", description: `${m.description || ""}\n[Client Revision Note]: ${revisionNotes}` })
        .eq("id", m.id);

      // Log activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: clientId,
        action: "milestone_revision_requested",
        description: `Requested revision on "${m.title}": ${revisionNotes}`,
      });

      // Post in messages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_messages").insert({
        client_id: clientId,
        sender: clientName,
        subject: `Revision Requested on ${m.title}`,
        body: `Client requested milestone revision: ${revisionNotes}`,
        important: true,
        is_read: false,
      });

      setRevisionMilestoneId(null);
      setRevisionNotes("");
      reloadMilestones();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActingMilestoneId(null);
    }
  }

  const active = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Engineering Projects & Milestones"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} on record · ${active.length} active in development`}
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/clients/chat"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEBE8] bg-white px-3.5 py-2 text-xs font-medium text-[#24262B] hover:bg-[#FAFAF8] transition-colors shadow-2xs"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#85BBD6]" />
              <span>Chat with Team</span>
            </Link>
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F8E8EF] border border-[#D9A7BC]/40 px-4 py-2 text-xs font-semibold text-[#24262B] hover:bg-[#F3D5E2] transition-all shadow-2xs"
            >
              <PlusCircle className="h-4 w-4 text-[#D9A7BC]" />
              <span>Start New Project</span>
            </button>
          </div>
        }
      />

      {/* Summary KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active in Production", val: active.length, iconBg: "bg-[#E5F3FA]", iconColor: "text-[#85BBD6]", icon: TrendingUp },
          { label: "Delivered & Live", val: completed.length, iconBg: "bg-[#FAFAF8]", iconColor: "text-[#638D79]", icon: CheckCircle2 },
          { label: "Total Engagements", val: projects.length, iconBg: "bg-[#F8E8EF]", iconColor: "text-[#D9A7BC]", icon: FolderKanban },
        ].map(({ label, val, iconBg, iconColor, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[#ECEBE8] bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-heading text-[#24262B]">{val}</p>
              <p className="text-xs font-medium text-[#85858D] mt-0.5">{label}</p>
            </div>
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 rounded-3xl border border-border bg-card">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card py-20 text-center p-6">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="font-display text-xl font-black text-foreground">No Projects Assigned Yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ready to launch your next web application, mobile app, or AI automated workflow?
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-4 w-4" /> Request Your First Project
          </button>
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
              <div key={p.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
                {/* Project card header */}
                <div className="p-6">
                  <div className="flex flex-wrap items-start gap-5">
                    {/* Ring progress chart */}
                    <div className="relative shrink-0">
                      <RingChart pct={pct} ring={meta.ring} size={64} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-foreground">{pct}%</span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-black text-foreground">{p.title}</h2>
                        <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase border ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        {p.service && (
                          <span className="rounded-full bg-muted px-3 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {p.service}
                          </span>
                        )}
                      </div>

                      {p.summary && (
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {p.summary}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: meta.ring }}
                          />
                        </div>
                      </div>

                      {/* Dates and counters */}
                      <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {p.start_date && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" /> Started {new Date(p.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {p.due_date && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadIcsFile(p.title, {
                                id: p.id,
                                title: p.title,
                                description: p.summary || undefined,
                                dueDate: p.due_date,
                              })
                            }
                            className="inline-flex items-center gap-1.5 hover:text-[#24262B] transition-colors group cursor-pointer"
                            title="Download calendar (.ics) invitation"
                          >
                            <Calendar className="h-3.5 w-3.5 text-[#85BBD6]" />
                            <span>Delivery Due {new Date(p.due_date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-[#85BBD6] group-hover:underline">(.ics)</span>
                          </button>
                        )}
                        {ms.length > 0 && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#24262B]">
                            <Milestone className="h-3.5 w-3.5 text-[#85BBD6]" /> {doneMilestones}/{ms.length} Milestones Verified
                          </span>
                        )}
                      </div>

                      {/* Deliverables / Deployment links */}
                      {(p.live_url || p.staging_url || p.repo_url) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.live_url && (
                            <a
                              href={p.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs"
                            >
                              <Globe className="h-3.5 w-3.5" /> Production URL
                            </a>
                          )}
                          {p.staging_url && (
                            <a
                              href={p.staging_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Staging Preview
                            </a>
                          )}
                          {p.repo_url && (
                            <a
                              href={p.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs"
                            >
                              <Github className="h-3.5 w-3.5" /> Code Repository
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-border hover:bg-muted text-muted-foreground transition-colors"
                      title={isExpanded ? "Collapse milestones" : "View milestones"}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Interactive Milestones & Connections */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-6 space-y-6">
                    <ProjectConnections projectId={p.id} showClient={false} />

                    {/* Milestones Engine */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                          <Milestone className="h-4 w-4 text-primary" /> Delivery Milestones &amp; Approvals
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Click Approve when verified or submit revision notes
                        </span>
                      </div>

                      {ms.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">
                          Milestones are being sequenced by the solution architect.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {ms.map((m, idx) => {
                            const isDone = m.status === "done";
                            const isInProgress = m.status === "in_progress";
                            const isReviewing = revisionMilestoneId === m.id;

                            return (
                              <div
                                key={m.id}
                                className={`rounded-2xl border p-4 transition-all ${
                                  isDone
                                    ? "border-emerald-200 bg-emerald-50/40"
                                    : isInProgress
                                    ? "border-primary/40 bg-card"
                                    : "border-border bg-card/60"
                                }`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`mt-0.5 h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 ${
                                        isDone
                                          ? "bg-emerald-500 border-emerald-500 text-white"
                                          : isInProgress
                                          ? "bg-amber-400 border-amber-400 text-white"
                                          : "bg-card border-muted-foreground/30 text-transparent"
                                      }`}
                                    >
                                      {isDone && <Check className="h-3.5 w-3.5" />}
                                      {isInProgress && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-bold ${isDone ? "text-emerald-950 line-through" : "text-foreground"}`}>
                                        {m.title}
                                      </p>
                                      {m.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                          {m.description}
                                        </p>
                                      )}
                                      {m.due_date && (
                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                          <Clock className="h-2.5 w-2.5" /> Expected {new Date(m.due_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Milestone Approval Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    {!isDone && (
                                      <>
                                        <button
                                          onClick={() => handleApproveMilestone(m, p)}
                                          disabled={actingMilestoneId === m.id}
                                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-60"
                                        >
                                          {actingMilestoneId === m.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Check className="h-3 w-3" />
                                          )}
                                          <span>Approve Milestone</span>
                                        </button>

                                        <button
                                          onClick={() => setRevisionMilestoneId(isReviewing ? null : m.id)}
                                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs"
                                        >
                                          <AlertCircle className="h-3 w-3 text-amber-500" />
                                          <span>Revision</span>
                                        </button>
                                      </>
                                    )}

                                    {isDone && (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Revision Note Box */}
                                {isReviewing && (
                                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                                    <label className="text-[11px] font-bold uppercase text-muted-foreground">
                                      What adjustments or feedback do you have for this milestone?
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={revisionNotes}
                                      onChange={(e) => setRevisionNotes(e.target.value)}
                                      placeholder="Describe requested adjustments..."
                                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setRevisionMilestoneId(null)}
                                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => submitRevision(m, p)}
                                        disabled={!revisionNotes.trim() || actingMilestoneId === m.id}
                                        className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                                      >
                                        Submit Revision Request
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Project Request Modal */}
      <ProjectRequestModal
        clientId={clientId}
        clientName={clientName}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onCreated={() => {
          reload();
          reloadMilestones();
        }}
      />
    </div>
  );
}
