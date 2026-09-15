import { createFileRoute } from "@tanstack/react-router";
import { StaffShell, StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff/messages")({
  head: () => ({
    meta: [
      { title: "Messages — AYMOXI Team Portal" },
      { name: "description", content: "Internal messages from management to your account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="messages">{(staff) => <Messages staffId={staff.id} />}</StaffShell>,
});

interface Msg { id: string; subject: string; body: string; sender: string; important: boolean; is_read: boolean; created_at: string }

function Messages({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffRows<Msg>("staff_messages", staffId, { orderBy: "created_at" });

  async function markRead(id: string) {
    await supabase.from("staff_messages").update({ is_read: true }).eq("id", id);
    reload();
  }

  return (
    <div>
      <StaffHeading title="Messages" subtitle={`${rows.filter((m) => !m.is_read).length} unread of ${rows.length}`} />
      {loading ? <StaffEmpty label="Loading messages…" /> : rows.length === 0 ? <StaffEmpty label="No messages yet." /> : (
        <div className="space-y-3">
          {rows.map((m) => (
            <article key={m.id} onClick={() => !m.is_read && markRead(m.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition ${m.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-black text-foreground">{m.subject}</h2>
                {m.important && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">important</span>}
                {!m.is_read && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">new</span>}
                <span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">From {m.sender}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
