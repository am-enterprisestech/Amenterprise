import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { ClientDedicatedChat } from "@/components/chat/ClientDedicatedChat";

export const Route = createFileRoute("/clients/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Delivery & Support Chat — AM Enterprises Client Portal" },
      { name: "description", content: "Real-time direct messaging with the AM Enterprises delivery team, architects, and support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClientChat,
});

function ClientChat() {
  return (
    <PortalShell>
      {(client) => (
        <ClientDedicatedChat
          clientId={client.id}
          clientName={client.name}
          clientEmail={client.email}
        />
      )}
    </PortalShell>
  );
}
