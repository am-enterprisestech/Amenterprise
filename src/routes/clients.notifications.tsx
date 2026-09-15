import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/clients/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications â€” AM Enterprises Client Portal" },
      { name: "description", content: "All alerts about project milestones, invoices and documents on your account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Notifications clientId={client.id} />}</PortalShell>,
});

interface Note { id: string; title: string; body: string | null; kind: string; link: string | null; is_read: boolean; created_at: string }

function Notifications({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = usePortalRows<Note>("client_notifications", clientId, { orderBy: "created_at" });
  const unread = rows.filter((n) => !n.is_read);

  async function markAll() {
    if (unread.length === 0) return;
    await supabase.from("client_notifications").update({ is_read: true }).in("id", unread.map((n) => n.id));
    reload();
  }

  async function toggle(n: Note) {
    await supabase.from("client_notifications").update({ is_read: !n.is_read }).eq("id", n.id);
    reload();
  }

  return (
    <div>
      <PortalHeading
        title="Notifications"
        subtitle={`${unread.length} unread`}
        right={unread.length > 0 ? (
          <button onClick={markAll} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        ) : undefined}
      />
      {loading ? <EmptyState label="Loading notificationsâ€¦" /> : rows.length === 0 ? <EmptyState label="No notifications yet." /> : (
        <div className="space-y-3">
          {rows.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${n.kind === "warning" ? "bg-amber-100 text-amber-700" : n.kind === "success" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => toggle(n)} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted">
                {n.is_read ? "Unread" : "Read"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
