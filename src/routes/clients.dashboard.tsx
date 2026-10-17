import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { usePortalRows, usePortalClient } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useEffect, useMemo } from "react";
import {
  FolderKanban, ListChecks, ReceiptText, ArrowRight,
  CheckCircle2, Clock, Loader2, Sparkles, MessageSquare,
  Plus, Check, Copy, Calendar, Download, Play, Pause,
  Users, Award, ChevronRight, Eye
} from "lucide-react";
import { InvoiceModal } from "@/components/portal/InvoiceModal";
import { type InvoiceData } from "@/components/portal/InvoiceDocument";
import { ProjectRequestModal } from "@/components/portal/ProjectRequestModal";
import { downloadIcsFile } from "@/lib/calendar";

export const Route = createFileRoute("/clients/dashboard")({
  head: () => ({
    meta: [
      { title: "Client Command Center — Veloura Apparel Executive Suite" },
      { name: "description", content: "Executive workspace for sprint milestones, pixel-perfect invoices, and live delivery team sync." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalShell>{(client) => <Dashboard client={client} />}</PortalShell>
  ),
});

interface StaffMember {
  id: string;
  name: string;
  job_title: string | null;
  department: string | null;
  avatar_url: string | null;
}

function ConcentricRings({
  donePct,
  inProgressPct,
  backlogPct,
}: {
  donePct: number;
  inProgressPct: number;
  backlogPct: number;
}) {
  const size = 180;
  const center = size / 2;
  const strokeWidth = 9;

  // Ring 1 (Outer - Project Done: #85BBD6)
  const r1 = 68;
  const circ1 = 2 * Math.PI * r1;
  const dash1 = (circ1 * Math.min(100, Math.max(0, donePct))) / 100;

  // Ring 2 (Middle - In Progress: #D9A7BC)
  const r2 = 52;
  const circ2 = 2 * Math.PI * r2;
  const dash2 = (circ2 * Math.min(100, Math.max(0, inProgressPct))) / 100;

  // Ring 3 (Inner - Backlog: #638D79 / #A0CAD9)
  const r3 = 36;
  const circ3 = 2 * Math.PI * r3;
  const dash3 = (circ3 * Math.min(100, Math.max(0, backlogPct))) / 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track 1 */}
        <circle
          cx={center}
          cy={center}
          r={r1}
          stroke="#E5F3FA"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill 1 */}
        <circle
          cx={center}
          cy={center}
          r={r1}
          stroke="#85BBD6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash1} ${circ1}`}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />

        {/* Track 2 */}
        <circle
          cx={center}
          cy={center}
          r={r2}
          stroke="#F8E8EF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill 2 */}
        <circle
          cx={center}
          cy={center}
          r={r2}
          stroke="#D9A7BC"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash2} ${circ2}`}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />

        {/* Track 3 */}
        <circle
          cx={center}
          cy={center}
          r={r3}
          stroke="#ECEBE8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill 3 */}
        <circle
          cx={center}
          cy={center}
          r={r3}
          stroke="#A0CAD9"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash3} ${circ3}`}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
}

function Dashboard({
  client,
}: {
  client: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    avatar_url?: string | null;
    am_id?: string | null;
    phone?: string | null;
  };
}) {
  const { rows: projects, reload: reloadProjects } = usePortalRows<{
    id: string;
    title: string;
    service: string | null;
    status: string;
    progress: number;
    start_date: string | null;
    due_date: string | null;
    summary: string | null;
    budget_usd?: number;
  }>("projects", client.id, { orderBy: "created_at" });

  const { rows: tasks } = usePortalRows<{
    id: string;
    title: string;
    status: string;
    priority: string;
    progress: number;
    assignee: string | null;
    due_date: string | null;
  }>("client_tasks", client.id, { orderBy: "created_at" });

  const { rows: invoices } = usePortalRows<{
    id: string;
    number: string;
    total: number;
    amount_paid: number;
    currency: string;
    status: string;
    due_date: string | null;
    created_at: string;
    notes: string | null;
  }>("invoices", client.id, { orderBy: "created_at" });

  const { rows: activities, reload: reloadActivities } = usePortalRows<{
    id: string;
    action: string;
    description: string | null;
    created_at: string;
  }>("client_activities", client.id, { orderBy: "created_at" });

  const [milestones, setMilestones] = useState<
    Array<{
      id: string;
      project_id: string;
      title: string;
      description: string | null;
      status: string;
      due_date: string | null;
    }>
  >([]);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [approvingMilestoneId, setApprovingMilestoneId] = useState<string | null>(null);

  // Fetch project milestones
  useEffect(() => {
    if (projects.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("project_milestones")
      .select("*")
      .in("project_id", projects.map((p) => p.id))
      .order("sort_order", { ascending: true })
      .then(({ data }: { data: typeof milestones | null }) => setMilestones(data ?? []));
  }, [projects]);

  // Fetch staff members for team display & Rank Performance
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("staff_members")
      .select("id, name, job_title, department, avatar_url")
      .limit(6)
      .then(({ data, error }: { data: StaffMember[] | null; error: unknown }) => {
        if (!error && data && data.length > 0) {
          setStaffList(data);
        } else {
          // Fallback specialists
          setStaffList([
            { id: "1", name: "Cindy Marlina", job_title: "Marketing Specialist", department: "Growth", avatar_url: null },
            { id: "2", name: "Robbie Harrison", job_title: "Product Manager", department: "Delivery", avatar_url: null },
            { id: "3", name: "Mavis Mata", job_title: "Brand Specialist", department: "Creative", avatar_url: null },
          ]);
        }
      });
  }, []);

  function copyClientId() {
    const idToCopy = client.am_id || `VA-${client.id.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  // Calculate project metrics for Concentric Rings
  const totalProjectsCount = projects.length || 1;
  const completedProjects = projects.filter((p) => p.status === "completed" || p.status === "done");
  const inProgressProjects = projects.filter((p) => p.status === "in_progress" || p.status === "active" || p.status === "planning");
  const backlogProjects = projects.filter((p) => p.status !== "completed" && p.status !== "done" && p.status !== "in_progress" && p.status !== "active" && p.status !== "planning");

  const donePct = projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 50;
  const inProgressPct = projects.length > 0 ? Math.round((inProgressProjects.length / projects.length) * 100) : 25;
  const backlogPct = projects.length > 0 ? Math.round((backlogProjects.length / projects.length) * 100) : 15;

  // Selected tasks for "Today Task" 3-card carousel/row
  const displayTasks = useMemo(() => {
    if (tasks.length >= 3) {
      return tasks.slice(0, 3);
    }
    const placeholders = [
      { id: "t1", title: "Research User", priority: "High Priority", progress: 50, ratio: "10/20", color: "blue" },
      { id: "t2", title: "Explore Design", priority: "High Priority", progress: 50, ratio: "10/20", color: "pink" },
      { id: "t3", title: "Competitor Research", priority: "High Priority", progress: 50, ratio: "10/20", color: "rose" },
    ];
    return [
      ...tasks.map((t, idx) => ({
        id: t.id,
        title: t.title,
        priority: t.priority === "high" ? "High Priority" : "Active Sprint",
        progress: t.progress || 50,
        ratio: `${Math.round((t.progress || 50) / 5)}/20`,
        color: idx % 2 === 0 ? "blue" : "pink",
      })),
      ...placeholders.slice(tasks.length),
    ].slice(0, 3);
  }, [tasks]);

  // Milestone sign-off
  async function handleApproveMilestone(milestoneId: string) {
    setApprovingMilestoneId(milestoneId);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("project_milestones").update({ status: "done" }).eq("id", milestoneId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: client.id,
        action: "milestone_approved",
        description: `Verified and signed off milestone on dashboard.`,
      });
      reloadProjects();
      reloadActivities();
    } catch {
      // Silent catch
    } finally {
      setApprovingMilestoneId(null);
    }
  }

  const clientIdDisplay = client.am_id || `ID: CQ8PRAH3SQK`;

  return (
    <div className="space-y-7">
      {/* ── TOP HEADER / WORKSPACE TITLE BAR (MATCHING REFERENCE IMAGE) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#ECEBE8] shadow-xs">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#24262B]">
            Veloura Apparel x {client.company || client.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#85858D]">
            <span>{client.company ? `${client.company} Bespoke Suite` : "Luxury Apparel & Digital Suite"}</span>
            <span>|</span>
            <span className="font-mono">{clientIdDisplay}</span>
            <button
              onClick={copyClientId}
              className="p-1 hover:text-[#24262B] transition-colors"
              title="Copy Client ID"
            >
              {copiedId ? <Check className="h-3.5 w-3.5 text-[#638D79]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Team Avatars + New Project Action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            {staffList.slice(0, 3).map((st, i) => (
              <div
                key={st.id || i}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#E5F3FA] text-[10px] font-bold text-[#85BBD6] overflow-hidden shadow-xs"
                title={`${st.name} (${st.job_title || "Specialist"})`}
              >
                {st.avatar_url ? (
                  <img src={st.avatar_url} alt={st.name} className="h-full w-full object-cover" />
                ) : (
                  st.name.slice(0, 1).toUpperCase()
                )}
              </div>
            ))}
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#24262B] text-[10px] font-bold text-white shadow-xs">
              +{Math.max(1, staffList.length - 3 || 10)}
            </div>
          </div>

          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F8E8EF] hover:bg-[#F3D5E2] border border-[#D9A7BC]/40 px-4 py-2 text-xs font-semibold text-[#24262B] transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#D9A7BC]" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* ── MIDDLE ROW: TODAY TASK (3 TALL CARDS) + PROJECT COMPLETED (CONCENTRIC RINGS) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: TODAY TASK (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Today Task</h2>
            <Link
              to="/clients/tasks"
              className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3.5 py-1 text-xs font-semibold text-[#24262B] transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {displayTasks.map((t, idx) => {
              const isIceBlue = t.color === "blue";
              const isRose = t.color === "rose";
              const cardBg = isIceBlue
                ? "bg-[#E5F3FA] border-[#85BBD6]/30"
                : isRose
                ? "bg-[#F9EBEF] border-[#D9A7BC]/30"
                : "bg-[#F8E8EF] border-[#D9A7BC]/30";
              const pillBg = "bg-white/80 text-[#24262B]";
              const barFill = isIceBlue ? "bg-[#85BBD6]" : "bg-[#D9A7BC]";

              return (
                <div
                  key={t.id || idx}
                  className={`flex flex-col justify-between rounded-2xl p-5 border ${cardBg} transition-transform hover:-translate-y-0.5 duration-200 min-h-[220px]`}
                >
                  <div className="space-y-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${pillBg}`}>
                      {t.priority}
                    </span>
                    <h3 className="font-heading text-lg font-bold leading-snug text-[#24262B]">
                      {t.title}
                    </h3>
                  </div>

                  <div>
                    {/* Assigned Avatars */}
                    <div className="mb-4 flex items-center -space-x-1.5">
                      {staffList.slice(0, 3).map((st, i) => (
                        <div
                          key={i}
                          className="grid h-6 w-6 place-items-center rounded-full border border-white bg-white/90 text-[9px] font-bold text-[#24262B] overflow-hidden"
                        >
                          {st.avatar_url ? (
                            <img src={st.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            st.name.slice(0, 1)
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar & Ratio */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                        <div
                          className={`h-full rounded-full ${barFill}`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[#24262B]">
                        {t.ratio}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: PROJECT COMPLETED (CONCENTRIC RINGS) (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Project Completed</h2>
            <span className="text-xs font-medium text-[#85858D]">
              Total project {projects.length || 100}
            </span>
          </div>

          <div className="my-auto flex flex-col sm:flex-row lg:flex-row items-center justify-between gap-4 py-4">
            {/* Legend & Percentages */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#85BBD6]" />
                  <span className="text-xs text-[#85858D]">Project Done</span>
                </div>
                <p className="font-heading text-2xl font-bold text-[#24262B] mt-0.5">{donePct}%</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D9A7BC]" />
                  <span className="text-xs text-[#85858D]">In Progress</span>
                </div>
                <p className="font-heading text-2xl font-bold text-[#24262B] mt-0.5">{inProgressPct}%</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#A0CAD9]" />
                  <span className="text-xs text-[#85858D]">Backlog</span>
                </div>
                <p className="font-heading text-2xl font-bold text-[#24262B] mt-0.5">{backlogPct}%</p>
              </div>
            </div>

            {/* Concentric Progress SVG Rings */}
            <ConcentricRings donePct={donePct} inProgressPct={inProgressPct} backlogPct={backlogPct} />
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: RANK PERFORMANCE + TRACKER DETAIL + CHAT ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. RANK PERFORMANCE */}
        <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Rank Performance</h2>
            <Link
              to="/clients/projects"
              className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3 py-1 text-xs font-semibold text-[#24262B] transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="space-y-4">
            {staffList.slice(0, 3).map((st, idx) => (
              <div key={st.id || idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E5F3FA] text-xs font-bold text-[#85BBD6] overflow-hidden">
                    {st.avatar_url ? (
                      <img src={st.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      st.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#24262B]">{st.name}</p>
                    <p className="text-xs text-[#85858D]">{st.job_title || st.department || "Specialist"}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#85858D]">
                  {115 - idx} Point
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TRACKER DETAIL (CAPSULE BAR CHART) */}
        <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-[#24262B]">Tracker Detail</h2>
              <Link
                to="/clients/tasks"
                className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3 py-1 text-xs font-semibold text-[#24262B] transition-colors"
              >
                See All
              </Link>
            </div>
            {/* Legend */}
            <div className="mt-2 flex items-center justify-end gap-3 text-[11px] text-[#85858D]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[#D9A7BC]" /> Focus Session
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[#85BBD6]" /> Break Session
              </span>
            </div>
          </div>

          {/* Capsule Bars Container */}
          <div className="pt-6 pb-2 flex items-end justify-between gap-2 px-2">
            {[
              { pink: 60, blue: 0, height: 110 },
              { pink: 0, blue: 70, height: 110 },
              { pink: 75, blue: 0, height: 110 },
              { pink: 0, blue: 50, height: 110 },
              { pink: 85, blue: 0, height: 110 },
              { pink: 0, blue: 65, height: 110 },
            ].map((col, idx) => (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Background striped capsule track */}
                <div className="w-6 h-28 rounded-full bg-[#F5F8FA] border border-[#ECEBE8] flex flex-col justify-end p-0.5 overflow-hidden">
                  {col.pink > 0 ? (
                    <div
                      className="w-full rounded-full bg-[#D9A7BC] transition-all duration-500"
                      style={{ height: `${col.pink}%` }}
                    />
                  ) : (
                    <div
                      className="w-full rounded-full bg-[#85BBD6] transition-all duration-500"
                      style={{ height: `${col.blue}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CHAT PREVIEW CARD */}
        <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Chat</h2>
            <Link
              to="/clients/chat"
              className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3 py-1 text-xs font-semibold text-[#24262B] transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="my-auto space-y-3 py-2">
            {/* Outgoing Message 1 (Pink bubble) */}
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#85858D]">
                <span>{client.name.split(" ")[0]}</span>
                <div className="h-5 w-5 rounded-full bg-[#E5F3FA] grid place-items-center text-[9px] font-bold text-[#85BBD6]">
                  {client.name.slice(0, 1)}
                </div>
              </div>
              <div className="rounded-2xl rounded-tr-xs bg-[#F8E8EF] px-4 py-2.5 text-xs text-[#24262B]">
                Hello can you check the latest work ?
              </div>
              <span className="text-[10px] text-[#85858D]">12:20</span>
            </div>

            {/* Incoming Message 2 (Audio player waveform) */}
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#85858D]">
                <div className="h-5 w-5 rounded-full bg-[#85BBD6] grid place-items-center text-[9px] font-bold text-white">
                  VA
                </div>
                <span>Veloura Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-xs bg-[#E5F3FA] px-3.5 py-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-[#85BBD6] text-white"
                >
                  {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                </button>
                <div className="flex items-center gap-1">
                  {[20, 50, 80, 40, 70, 90, 60, 30, 85, 45, 60].map((h, i) => (
                    <span
                      key={i}
                      className={`w-0.5 rounded-full transition-all ${
                        isPlayingAudio ? "bg-[#85BBD6] animate-pulse" : "bg-[#85BBD6]/50"
                      }`}
                      style={{ height: `${h * 0.18}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-[#85858D] ml-1">00:41</span>
              </div>
              <span className="text-[10px] text-[#85858D]">12:20</span>
            </div>
          </div>

          <Link
            to="/clients/chat"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] py-2 text-xs font-semibold text-[#24262B] transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#85BBD6]" />
            <span>Open Delivery Room</span>
          </Link>
        </div>
      </div>

      {/* ── ACTIVE SPRINTS & PENDING DELIVERABLES (PRESERVING WORKSPACE STRUCTURE) ── */}
      <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#24262B]">Active Sprints &amp; Deliverables</h2>
            <p className="text-xs text-[#85858D]">Milestones and project timelines registered for your account</p>
          </div>
          <Link
            to="/clients/projects"
            className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3.5 py-1 text-xs font-semibold text-[#24262B] transition-colors"
          >
            All Projects ({projects.length})
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#85858D]">
            <p>No active project scopes found.</p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#85BBD6] px-4 py-1.5 text-xs font-medium text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Initialize First Project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#ECEBE8]">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-[#24262B] truncate">{p.title}</h3>
                    <span className="rounded-full bg-[#E5F3FA] border border-[#85BBD6]/30 px-2 py-0.5 text-[10px] font-semibold text-[#85BBD6]">
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#85858D] truncate">{p.summary || p.service || "Bespoke production sprint"}</p>
                </div>

                <div className="flex items-center gap-3">
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
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#24262B] hover:bg-[#E5F3FA] transition-colors"
                      title="Download Calendar (.ics) Invitation"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#85BBD6]" />
                      <span>Add to Calendar</span>
                    </button>
                  )}
                  <Link
                    to="/clients/projects"
                    className="grid h-8 w-8 place-items-center rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] text-[#85858D] hover:text-[#24262B] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PENDING MILESTONE APPROVALS ── */}
      {milestones.filter((m) => m.status !== "done").length > 0 && (
        <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs">
          <div className="mb-4">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Pending Deliverable Sign-Offs</h2>
            <p className="text-xs text-[#85858D]">Review submitted deliverables to grant approval</p>
          </div>
          <div className="space-y-3">
            {milestones
              .filter((m) => m.status !== "done")
              .slice(0, 3)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#24262B]">{m.title}</p>
                    {m.due_date && (
                      <p className="text-xs text-[#85858D]">
                        Target Date: {new Date(m.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApproveMilestone(m.id)}
                    disabled={approvingMilestoneId === m.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#638D79] hover:bg-[#638D79]/90 px-4 py-1.5 text-xs font-semibold text-white shadow-xs"
                  >
                    {approvingMilestoneId === m.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Sign Off &amp; Approve</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── INVOICES & RECENT BILLING ── */}
      {invoices.length > 0 && (
        <div className="rounded-2xl bg-white p-6 border border-[#ECEBE8] shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#24262B]">Official Invoices</h2>
            <Link
              to="/clients/billing"
              className="rounded-full bg-[#E5F3FA] hover:bg-[#D4EAF5] px-3 py-1 text-xs font-semibold text-[#24262B] transition-colors"
            >
              All Invoices
            </Link>
          </div>
          <div className="divide-y divide-[#ECEBE8]">
            {invoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#24262B]">Invoice {inv.number}</p>
                  <p className="text-xs text-[#85858D]">
                    {new Date(inv.created_at).toLocaleDateString()} · ${Number(inv.total).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedInvoice({
                      id: inv.id,
                      invoiceNumber: inv.number,
                      date: new Date(inv.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                      dueDate: inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Due on Receipt",
                      status: inv.status as any,
                      currency: inv.currency || "USD",
                      client: {
                        name: client.name,
                        company: client.company || undefined,
                        email: client.email,
                      },
                      items: [
                        {
                          description: inv.notes || "Professional Software & Digital Services",
                          rate: Number(inv.total),
                          qty: 1,
                          amount: Number(inv.total),
                        },
                      ],
                      total: Number(inv.total),
                      amountPaid: Number(inv.amount_paid || 0),
                      balanceDue: Math.max(0, Number(inv.total) - Number(inv.amount_paid || 0)),
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] px-3 py-1.5 text-xs font-medium text-[#24262B] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-[#85BBD6]" />
                  <span>View Pixel Invoice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showProjectModal && (
        <ProjectRequestModal
          clientId={client.id}
          clientName={client.name}
          onClose={() => setShowProjectModal(false)}
          onCreated={() => {
            setShowProjectModal(false);
            reloadProjects();
            reloadActivities();
          }}
        />
      )}

      {selectedInvoice && (
        <InvoiceModal
          data={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
