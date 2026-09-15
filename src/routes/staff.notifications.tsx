import { createFileRoute } from "@tanstack/react-router";
import { StaffShell, StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/staff/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AYMOXI Team Portal" },
      { name: "description", content: "All alerts and updates for your team account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="notifications">{(staff) => <Notifications staffId={staff.id} />}</StaffShell>,
});

interface Note { id: string; title: string; body: string | null; kind: string; is_read: boolean; created_at: string }

function Notifications({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffRows<Note>("staff_notifications", staffId, { orderBy: "created_at" });
  const unread = rows.filter((n) => !n.is_read);

  async function markAll() {
    await supabase.from("staff_notifications").update({ is_read: true }).eq("staff_id", staffId).eq("is_read", false);
    reload();
  }

  return (
    <div>
      <StaffHeading
        title="Notifications"
        subtitle={`${unread.length} unread of ${rows.length}`}
        right={unread.length > 0 ? (
          <button onClick={markAll} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        ) : undefined}
      />
      {loading ? <StaffEmpty label="Loading…" /> : rows.length === 0 ? <StaffEmpty label="No notifications yet." /> : (
        <div className="space-y-3">
          {rows.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{n.kind} · {new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={async () => { await supabase.from("staff_notifications").update({ is_read: true }).eq("id", n.id); reload(); }}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase text-foreground hover:bg-muted">Read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
