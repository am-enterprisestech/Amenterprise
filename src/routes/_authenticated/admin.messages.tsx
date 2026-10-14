import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: () => (
    <CrudTable
      table="contact_messages"
      title="Messages"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "is_read", label: "Mark as read", type: "boolean" },
      ]}
      listColumns={[
        { key: "created_at", label: "Received", render: (r) => new Date(String(r.created_at)).toLocaleString() },
        { key: "name", label: "From" },
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message", render: (r) => <span className="line-clamp-2 max-w-md">{String(r.message)}</span> },
        { key: "is_read", label: "Read", render: (r) => (r.is_read ? "✓" : "•") },
      ]}
    />
  ),
});