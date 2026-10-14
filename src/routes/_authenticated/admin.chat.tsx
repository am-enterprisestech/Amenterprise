import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Browser-only APIs (MediaRecorder) — must not run on server
const ChatPanel = lazy(() =>
  import("@/components/chat/ChatPanel").then((m) => ({ default: m.ChatPanel }))
);

export const Route = createFileRoute("/_authenticated/admin/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat \u2014 AM Enterprises Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminChat,
});

function AdminChat() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-black text-foreground">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Message clients and team members in real time
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Suspense fallback={
          <div className="grid h-full place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }>
          <ChatPanel />
        </Suspense>
      </div>
    </div>
  );
}
