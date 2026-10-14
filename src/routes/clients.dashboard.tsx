import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { usePortalClient } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState } from "react";
import {
  FolderKanban, ListChecks, ReceiptText, Bell, ArrowRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Upload,
  Loader2, Zap, Star, Activity, ChevronRight, Calendar,
  DollarSign, Target, Award, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/clients/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AM Enterprises Client Portal" },
      { name: "description", content: "Your project overview, tasks, invoices and activity." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalShell>{(client) => <Dashboard client={client} />}</PortalShell>
  ),
});

// ─── helpers ────────────────────────────────────────────────────────────────

function statusColor(s: string) {
  if (s === "completed" || s === "done" || s === "paid") return "bg-emerald-500";
  if (s === "in_progress" || s === "active") return "bg-blue-500";
  if (s === "overdue" || s === "cancelled") return "bg-red-500";
  return "bg-amber-400";
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    done: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    active: "bg-blue-100 text-blue-700",
    review: "bg-violet-100 text-violet-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[s] ?? "bg-amber-100 text-amber-700";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Avatar with upload ──────────────────────────────────────────────────────

function ClientAvatar({ client }: { client: { id: string; name: string; avatar_url?: string | null } }) {
  const [avatar, setAvatar] = useState<string | null>(client.avatar_url ?? null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { refresh } = usePortalClient();

  async function onFile(file: File) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    setBusy(true);
    const path = `clients/${client.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { setBusy(false); return; }
    const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (data) {
      await supabase.from("portal_clients").update({ avatar_url: data.signedUrl }).eq("id", client.id);
      setAvatar(data.signedUrl);
      refresh();
    }
    setBusy(false);
  }

  return (
    <div className="group relative">
      <div className="relative h-20 w-20 shrink-0">
        {avatar
          ? <img src={avatar} alt={client.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-xl" />
          : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white shadow-xl grid place-items-center">
              <span className="text-3xl font-black text-white">{client.name.slice(0, 1).toUpperCase()}</span>
            </div>
          )
        }
        {/* upload overlay */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          {busy
            ? <Loader2 className="h-5 w-5 animate-spin text-white" />
            : <Upload className="h-5 w-5 text-white" />
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </div>
      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; trend?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg ${color}`}>
      {/* background decor */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-semibold text-white/80">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-white/60">{sub}</p>}
        {trend && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
            <TrendingUp className="h-3 w-3" /> {trend}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ring progress ───────────────────────────────────────────────────────────

function RingProgress({ pct, size = 48, stroke = 5, color = "#6366f1" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, Math.max(0, pct / 100));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="#e5e7eb" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={color} fill="none"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBar({ values, color = "bg-indigo-500" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => (
        <div key={i} className={`flex-1 rounded-sm ${color} opacity-${i === values.length - 1 ? "100" : "60"}`}
          style={{ height: `${Math.max(4, (v / max) * 40)}px` }} />
      ))}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

function Dashboard({ client }: { client: { id: string; name: string; email: string; company: string | null; avatar_url?: string | null; am_id?: string | null } }) {
  const { rows: projects } = usePortalRows<{ id: string; title: string; status: string; progress: number; due_date: string | null; description: string | null }>("projects", client.id, { orderBy: "created_at" });
  const { rows: tasks } = usePortalRows<{ id: string; title: string; status: string; priority: string; due_date: string | null }>("client_tasks", client.id, { orderBy: "created_at" });
  const { rows: invoices } = usePortalRows<{ id: string; number: string; total: number; amount_paid: number; currency: string; status: string; due_date: string | null }>("invoices", client.id, { orderBy: "created_at" });
  const { rows: notifications } = usePortalRows<{ id: string; title: string; body: string | null; kind: string; is_read: boolean; created_at: string }>("client_notifications", client.id, { orderBy: "created_at" });
  const { rows: activities } = usePortalRows<{ id: string; action: string; description: string | null; created_at: string }>("client_activities", client.id, { orderBy: "created_at" });

  const activeProjects = projects.filter((p) => p.status !== "completed");
  const openTasks = tasks.filter((t) => t.status !== "done");
  const urgentTasks = tasks.filter((t) => t.priority === "high" && t.status !== "done");
  const totalDue = invoices.reduce((s, i) => s + Math.max(0, Number(i.total ?? 0) - Number(i.amount_paid ?? 0)), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.amount_paid ?? 0), 0);
  const unread = notifications.filter((n) => !n.is_read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Fake weekly task sparkline from real data
  const taskSparkline = [
    tasks.filter((t) => t.status === "done").length,
    openTasks.length,
    urgentTasks.length,
    invoices.length,
    activeProjects.length,
    notifications.length,
    activities.length,
  ];

  return (
    <div className="space-y-8">

      {/* ── Hero welcome banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-7 text-white shadow-2xl">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-32 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-wrap items-center gap-6">
          <ClientAvatar client={client} />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white/70">{greeting} 👋</p>
            <h1 className="mt-0.5 font-display text-3xl font-black tracking-tight">{client.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
              {client.company && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Award className="h-3.5 w-3.5" /> {client.company}
                </span>
              )}
              {client.am_id && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5" /> {client.am_id}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Zap className="h-3.5 w-3.5" /> Active client
              </span>
            </div>
            <p className="mt-2 text-xs text-white/50">{client.email}</p>
          </div>

          {/* quick stats inside hero */}
          <div className="hidden xl:flex gap-4">
            {[
              { label: "Projects", val: activeProjects.length, icon: FolderKanban },
              { label: "Tasks", val: openTasks.length, icon: ListChecks },
              { label: "Alerts", val: unread, icon: Bell },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-sm min-w-[80px]">
                <Icon className="h-5 w-5 mb-1 text-white/70" />
                <span className="text-2xl font-black">{val}</span>
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* hover tip */}
        <p className="relative mt-5 text-xs text-white/50">
          💡 Hover on your photo to upload a new profile picture from your device
        </p>
      </div>

      {/* ── 4 stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Active Projects" value={String(activeProjects.length)}
          sub={`${projects.length} total`} color="bg-gradient-to-br from-indigo-500 to-indigo-700"
          trend={activeProjects.length > 0 ? "In progress" : undefined} />
        <StatCard icon={Target} label="Open Tasks" value={String(openTasks.length)}
          sub={urgentTasks.length > 0 ? `${urgentTasks.length} urgent` : "All on track"}
          color={urgentTasks.length > 0 ? "bg-gradient-to-br from-red-500 to-rose-700" : "bg-gradient-to-br from-emerald-500 to-teal-700"} />
        <StatCard icon={DollarSign} label="Outstanding" value={`$${totalDue.toLocaleString()}`}
          sub={`$${totalPaid.toLocaleString()} paid`} color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={Bell} label="Notifications" value={String(unread)}
          sub="Unread alerts" color="bg-gradient-to-br from-purple-500 to-violet-700"
          trend={unread > 0 ? `${unread} new` : undefined} />
      </div>

      {/* ── Projects + Tasks row ──────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Projects — 3 cols */}
        <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
                <FolderKanban className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-black text-foreground">Project Progress</h2>
            </div>
            <Link to="/clients/projects" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
                <FolderKanban className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground">Your projects will appear here once assigned</p>
            </div>
          ) : (
            <div className="space-y-5">
              {projects.slice(0, 4).map((p) => {
                const pct = Math.min(100, Math.max(0, p.progress ?? 0));
                const ringColor = pct >= 100 ? "#10b981" : pct >= 60 ? "#6366f1" : pct >= 30 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={p.id} className="flex items-center gap-4">
                    <RingProgress pct={pct} size={52} stroke={5} color={ringColor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-foreground">{p.title}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(p.status)}`}>{p.status.replace("_", " ")}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: ringColor }} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pct}% complete</span>
                        {p.due_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks — 2 cols */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <ListChecks className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-black text-foreground">Tasks</h2>
            </div>
            <Link to="/clients/tasks" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* task summary rings */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              { label: "Open", count: openTasks.length, color: "#6366f1" },
              { label: "Urgent", count: urgentTasks.length, color: "#ef4444" },
              { label: "Done", count: tasks.filter((t) => t.status === "done").length, color: "#10b981" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex flex-col items-center rounded-2xl bg-muted/50 py-3 gap-1">
                <RingProgress pct={tasks.length ? (count / tasks.length) * 100 : 0} size={40} stroke={4} color={color} />
                <span className="text-sm font-black text-foreground">{count}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>

          {openTasks.length === 0 ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-1" />
              <p className="text-sm font-bold text-emerald-700">All clear!</p>
              <p className="text-xs text-emerald-600">No open tasks right now</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {openTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-400" : "bg-emerald-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{t.title}</p>
                    {t.due_date && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" /> Due {new Date(t.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${t.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{t.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Invoices + Activity + Notifications ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Invoices */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <ReceiptText className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-black text-foreground">Billing</h2>
            </div>
            <Link to="/clients/billing" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* paid vs outstanding bar */}
          {invoices.length > 0 && (
            <div className="mb-5 rounded-2xl bg-muted/50 p-4">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>Paid</span><span>Outstanding</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted flex">
                {totalPaid + totalDue > 0 && (
                  <>
                    <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${(totalPaid / (totalPaid + totalDue)) * 100}%` }} />
                    <div className="h-full bg-amber-400 flex-1 rounded-r-full" />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm font-black text-emerald-600">${totalPaid.toLocaleString()}</span>
                <span className="text-sm font-black text-amber-600">${totalDue.toLocaleString()}</span>
              </div>
            </div>
          )}

          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
          ) : (
            <ul className="space-y-2">
              {invoices.slice(0, 4).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">#{inv.number}</p>
                    {inv.due_date && <p className="text-[10px] text-muted-foreground mt-0.5">Due {new Date(inv.due_date).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{inv.currency} {Number(inv.total).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${statusBadge(inv.status)}`}>{inv.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <Bell className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-black text-foreground">Notifications</h2>
              {unread > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-600 text-[10px] font-black text-white">{unread}</span>
              )}
            </div>
            <Link to="/clients/notifications" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className={`rounded-xl p-3 transition-colors ${n.is_read ? "border border-border" : "border border-purple-200 bg-purple-50"}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-muted-foreground/30" : "bg-purple-500"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground leading-snug">{n.title}</p>
                      {n.body && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity timeline */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-blue-600">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="font-display text-base font-black text-foreground">Activity</h2>
          </div>

          {/* mini bar chart */}
          <div className="mb-4 rounded-2xl bg-muted/50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Account activity</p>
            <MiniBar values={taskSparkline} color="bg-blue-500" />
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
          ) : (
            <ul className="space-y-3 border-l-2 border-dashed border-border pl-4">
              {activities.slice(0, 6).map((a, i) => (
                <li key={a.id} className="relative">
                  <div className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-card border-2 border-blue-400" />
                  <p className="text-xs font-semibold text-foreground leading-snug">{a.description || a.action.replace(/_/g, " ")}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(a.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/clients/projects", label: "View Projects", desc: "Track progress", icon: FolderKanban, color: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700" },
          { to: "/clients/billing", label: "View Invoices", desc: "Payments & billing", icon: ReceiptText, color: "from-amber-50 to-amber-100 border-amber-200 text-amber-700" },
          { to: "/clients/chat", label: "Live Chat", desc: "Talk to your team", icon: BarChart3, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
          { to: "/clients/support", label: "Get Support", desc: "Open a ticket", icon: AlertCircle, color: "from-purple-50 to-purple-100 border-purple-200 text-purple-700" },
        ].map((item) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link key={item.to} to={item.to as any} className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-br ${item.color} p-4 hover:shadow-md transition-all group`}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/60">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-xs opacity-70">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

    </div>
  );
}
