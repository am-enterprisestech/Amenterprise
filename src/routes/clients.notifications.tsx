import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, Zap, Trash2 } from "lucide-react";

export const Route = createFileRoute("/clients/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AM Enterprises Client Portal" },
      { name: "description", content: "All alerts about project milestones, invoices and documents on your account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Notifications clientId={client.id} />}</PortalShell>,
});

interface Note { id: string; title: string; body: string | null; kind: string; link: string | null; is_read: boolean; created_at: string }

const KIND_META: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  info:     { icon: Info,         bg: "bg-blue-100",    color: "text-blue-600"    },
  warning:  { icon: AlertTriangle, bg: "bg-amber-100",  color: "text-amber-600"   },
  success:  { icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600" },
  team:     { icon: Zap,          bg: "bg-indigo-100",  color: "text-indigo-600"  },
  project:  { icon: Zap,          bg: "bg-purple-100",  color: "text-purple-600"  },
  invoice:  { icon: Bell,         bg: "bg-orange-100",  color: "text-orange-600"  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Notifications({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("client_notifications")
      .select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    setRows((data as Note[]) ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();

    // Realtime subscription
    const ch = supabase
      .channel(`client-notifications-${clientId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, {
        event: "*", schema: "public", table: "client_notifications",
        filter: `client_id=eq.${clientId}`,
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [clientId, load]);

  const unread = rows.filter((n) => !n.is_read);
  const visible = filter === "unread" ? unread : rows;

  async function markAll() {
    if (unread.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("client_notifications")
      .update({ is_read: true }).in("id", unread.map((n) => n.id));
    load();
  }

  async function toggle(n: Note) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("client_notifications")
      .update({ is_read: !n.is_read }).eq("id", n.id);
    load();
  }

  async function deleteAll() {
    if (!confirm("Delete all notifications?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("client_notifications").delete().eq("client_id", clientId);
    load();
  }

  return (
    <div>
      <PortalHeading
        title="Notifications"
        subtitle={unread.length > 0 ? `${unread.length} unread` : "All caught up"}
        right={
          <div className="flex items-center gap-2">
            {unread.length > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </button>
            )}
          </div>
        }
      />

      {/* Filter tabs + stats */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-full border border-border p-0.5 bg-card">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f} {f === "unread" && unread.length > 0 && `(${unread.length})`}
            </button>
          ))}
        </div>
        {rows.length > 0 && (
          <button onClick={deleteAll} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Realtime indicator */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live updates active
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="font-display text-lg font-black text-foreground">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            New alerts will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const meta = KIND_META[n.kind] ?? KIND_META.info;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  n.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.bg}`}>
                  <Icon className={`h-5 w-5 ${meta.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold text-foreground ${!n.is_read ? "text-primary" : ""}`}>{n.title}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                  {!n.is_read && (
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <button
                  onClick={() => toggle(n)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-[10px] font-bold text-foreground hover:bg-muted transition-colors"
                >
                  {n.is_read ? "Unread" : "Read"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
