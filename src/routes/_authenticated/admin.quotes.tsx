import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  component: () => (
    <CrudTable
      table="quote_requests"
      title="Quote requests"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "status", label: "Status", type: "select", options: ["new","contacted","won","lost"] },
        { name: "is_read", label: "Mark as read", type: "boolean" },
      ]}
      listColumns={[
        { key: "created_at", label: "Received", render: (r) => new Date(String(r.created_at)).toLocaleString() },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "service", label: "Service" },
        { key: "budget", label: "Budget" },
        { key: "message", label: "Details", render: (r) => <span className="line-clamp-2 max-w-md">{String(r.message ?? "")}</span> },
        { key: "status", label: "Status" },
        { key: "is_read", label: "Read", render: (r) => (r.is_read ? "✓" : "•") },
      ]}
    />
  ),
});
