import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/clients/messages")({
  head: () => ({
    meta: [
      { title: "Messages â€” AM Enterprises Client Portal" },
      { name: "description", content: "Read updates and announcements sent to you by the AM Enterprises delivery team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Messages clientId={client.id} />}</PortalShell>,
});

interface Msg { id: string; subject: string; body: string; sender: string; important: boolean; is_read: boolean; created_at: string }

function Messages({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = usePortalRows<Msg>("client_messages", clientId, { orderBy: "created_at" });
  const [openId, setOpenId] = useState<string | null>(null);

  async function open(m: Msg) {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.is_read) {
      await supabase.from("client_messages").update({ is_read: true }).eq("id", m.id);
      reload();
    }
  }

  const unread = rows.filter((m) => !m.is_read).length;

  return (
    <div>
      <PortalHeading title="Messages" subtitle={`${unread} unread of ${rows.length}`} />
      {loading ? <EmptyState label="Loading messagesâ€¦" /> : rows.length === 0 ? <EmptyState label="No messages yet." /> : (
        <div className="space-y-3">
          {rows.map((m) => (
            <button key={m.id} onClick={() => open(m)}
              className={`block w-full rounded-2xl border p-5 text-left transition ${m.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex flex-wrap items-center gap-2">
                {m.important && <Star className="h-4 w-4 fill-amber-400 text-amber-500" />}
                <p className="font-display font-black text-foreground">{m.subject}</p>
                {!m.is_read && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">New</span>}
                <span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">From {m.sender}</p>
              <p className={`mt-2 whitespace-pre-wrap text-sm text-muted-foreground ${openId === m.id ? "" : "line-clamp-2"}`}>{m.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
