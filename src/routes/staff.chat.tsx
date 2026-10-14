import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { StaffShell, StaffHeading } from "@/components/portal/StaffShell";

// Browser-only APIs (MediaRecorder) — must not run on server
const ChatPanel = lazy(() =>
  import("@/components/chat/ChatPanel").then((m) => ({ default: m.ChatPanel }))
);

export const Route = createFileRoute("/staff/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat \u2014 AM Enterprises Team Portal" },
      { name: "description", content: "Real-time team messaging, groups, voice notes and file sharing." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffChat,
});

function StaffChat() {
  return (
    <StaffShell module="chat">
      {() => (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
          <StaffHeading
            title="Team Chat"
            subtitle="Real-time messaging, groups, voice notes and file sharing"
          />
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
      )}
    </StaffShell>
  );
}
