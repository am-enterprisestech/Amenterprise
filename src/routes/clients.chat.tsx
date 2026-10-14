import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

// Browser-only APIs (MediaRecorder) — must not run on server
const ChatPanel = lazy(() =>
  import("@/components/chat/ChatPanel").then((m) => ({ default: m.ChatPanel }))
);

export const Route = createFileRoute("/clients/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Chat — AM Enterprises Client Portal" },
      { name: "description", content: "Real-time messaging with the AM Enterprises team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClientChat,
});

function ClientChat() {
  return (
    <PortalShell>
      {(client) => (
        <div className="flex h-[calc(100vh-7rem)] flex-col gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/20">
              <span className="text-lg">💬</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div>
              <p className="font-display text-base font-black text-white">Live Chat</p>
              <p className="text-xs text-white/70">AM Enterprises Team · Usually replies in minutes</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* chat panel */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="grid h-full place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }>
              {/* Pass client name/id so useMe can be pre-seeded */}
              <ChatPanel clientName={client.name} clientUserId={client.user_id ?? undefined} />
            </Suspense>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
