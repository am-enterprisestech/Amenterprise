import { createFileRoute, Link } from "@tanstack/react-router";
import { StaffShell, StaffHeading } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { ListChecks, MessagesSquare, Bell, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/staff/dashboard")({
  head: () => ({
    meta: [
      { title: "Team Overview — AM Enterprises Team Portal" },
      { name: "description", content: "Your assigned tasks, messages and updates at a glance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="dashboard">{(staff) => <Overview staffId={staff.id} name={staff.name} />}</StaffShell>,
});

function Stat({ icon: Icon, label, value, hint }: { icon: typeof ListChecks; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Overview({ staffId, name }: { staffId: string; name: string }) {
  const { rows: tasks } = useStaffRows<{ id: string; title: string; status: string; priority: string; due_date: string | null }>("staff_tasks", staffId, { orderBy: "created_at" });
  const { rows: messages } = useStaffRows<{ id: string; subject: string; is_read: boolean; created_at: string }>("staff_messages", staffId, { orderBy: "created_at" });
  const { rows: notifications } = useStaffRows<{ id: string; title: string; body: string | null; is_read: boolean; created_at: string }>("staff_notifications", staffId, { orderBy: "created_at" });
  const { rows: docs } = useStaffRows<{ id: string; name: string }>("staff_documents", staffId, { orderBy: "created_at" });

  const open = tasks.filter((t) => t.status !== "done");
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <StaffHeading title={`Welcome back, ${name.split(" ")[0]}`} subtitle="Here's what needs your attention today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ListChecks} label="Open tasks" value={String(open.length)} hint={`${tasks.length} total`} />
        <Stat icon={MessagesSquare} label="Unread messages" value={String(unread)} hint={`${messages.length} total`} />
        <Stat icon={Bell} label="Notifications" value={String(notifications.filter((n) => !n.is_read).length)} hint={`${notifications.length} total`} />
        <Stat icon={FileText} label="Resources" value={String(docs.length)} hint="Shared with you" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-foreground">Priority tasks</h2>
            <Link to="/staff/tasks" className="inline-flex items-center gap-1 text-xs font-bold text-primary">All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {open.length === 0 ? <p className="text-sm text-muted-foreground">Nothing open. Great work.</p> : (
            <ul className="space-y-3">
              {open.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{t.status.replace("_", " ")} · {t.priority}{t.due_date ? ` · due ${new Date(t.due_date).toLocaleDateString()}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-foreground">Latest updates</h2>
            <Link to="/staff/notifications" className="inline-flex items-center gap-1 text-xs font-bold text-primary">All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No updates yet.</p> : (
            <ul className="space-y-3">
              {notifications.slice(0, 6).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
