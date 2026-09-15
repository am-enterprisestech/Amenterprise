import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { generateAMID } from "@/lib/am-id";
import { WhatsAppChat } from "@/components/chat/WhatsAppChat";
import { FolderKanban, ListChecks, ReceiptText, ShieldCheck, ArrowRight } from "lucide-react";

import { PortalRoleSwitcher } from "@/components/portal/PortalRoleSwitcher";

export const Route = createFileRoute("/clients/dashboard")({
  head: () => ({
    meta: [
      { title: "Client Command Center — AM Enterprise Client Portal" },
      { name: "description", content: "Your project progress, live chat, open tasks, outstanding invoices, and activity." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalShell>
      {(client) => (
        <>
          <Overview client={client} />
          <PortalRoleSwitcher activeRoleKey="client" />
        </>
      )}
    </PortalShell>
  ),
});

function Stat({ icon: Icon, label, value, hint }: { icon: typeof FolderKanban; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-espresso/10 bg-card p-5 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-espresso/10 text-espresso"><Icon className="h-5 w-5" /></div>
      <p className="font-display text-2xl font-black text-espresso">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">{label}</p>
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Overview({ client }: { client: any }) {
  const { rows: projects } = usePortalRows<{ id: string; title: string; status: string; progress: number; due_date: string | null }>("projects", client.id, { orderBy: "created_at" });
  const { rows: tasks } = usePortalRows<{ id: string; title: string; status: string; due_date: string | null }>("client_tasks", client.id, { orderBy: "created_at" });
  const { rows: invoices } = usePortalRows<{ id: string; number: string; total: number; amount_paid: number; currency: string; status: string }>("invoices", client.id, { orderBy: "created_at" });
  const { rows: activities } = usePortalRows<{ id: string; action: string; description: string | null; created_at: string }>("client_activities", client.id, { orderBy: "created_at" });

  const amId = client.am_id || generateAMID("client", client.id);

  const currentUser = {
    id: client.id,
    am_id: amId,
    name: client.name,
    role: "Client Account",
    type: "client" as const,
  };

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const due = invoices.reduce((s, i) => s + Math.max(0, Number(i.total ?? 0) - Number(i.amount_paid ?? 0)), 0);
  const activeProjects = projects.filter((p) => p.status !== "completed").length;

  return (
    <div className="space-y-8">
      {/* Client Header Banner with Unique AM ID */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-espresso via-cocoa to-espresso p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sand">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Permanent AM ID: {amId}
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{client.name} — Client Portal</h1>
            <p className="mt-1 text-xs text-sand/70">Welcome to your dedicated workspace. Track project progress, pay invoices, and chat directly with your team.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FolderKanban} label="Active projects" value={String(activeProjects)} hint={`${projects.length} total`} />
        <Stat icon={ListChecks} label="Open tasks" value={String(openTasks)} hint={`${tasks.length} total`} />
        <Stat icon={ReceiptText} label="Outstanding" value={`$${due.toLocaleString()}`} hint={`${invoices.length} invoices`} />
        <Stat icon={ShieldCheck} label="Account Status" value="Active" hint="AM Enterprise Verified" />
      </div>

      {/* Project Progress & Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-espresso">Project progress</h2>
            <Link to="/clients/projects" className="inline-flex items-center gap-1 text-xs font-bold text-espresso hover:underline">All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {projects.length === 0 ? <p className="text-sm text-foreground/50">No active projects linked yet.</p> : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div className="mb-1 flex items-center justify-between text-sm font-bold text-espresso">
                    <span className="truncate">{p.title}</span>
                    <span className="text-xs text-espresso/70">{p.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-espresso transition-all" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-espresso">Recent activity timeline</h2>
          {activities.length === 0 ? <p className="text-sm text-foreground/50">No activity recorded yet.</p> : (
            <ul className="space-y-3">
              {activities.slice(0, 6).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-espresso" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-espresso">{a.description || a.action}</p>
                    <p className="text-xs text-foreground/50">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Live WhatsApp Chat embedded in Client Portal */}
      <div className="pt-6 border-t border-espresso/10">
        <h2 className="mb-4 font-display text-lg font-black text-espresso">Live Team Communication</h2>
        <WhatsAppChat currentUser={currentUser} />
      </div>
    </div>
  );
}

