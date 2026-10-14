import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: () => (
    <CrudTable
      table="bookings"
      title="Bookings"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "status", label: "Status", type: "select", options: ["new","confirmed","completed","cancelled"] },
        { name: "is_read", label: "Mark as read", type: "boolean" },
      ]}
      listColumns={[
        { key: "created_at", label: "Received", render: (r) => new Date(String(r.created_at)).toLocaleString() },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "preferred_date", label: "Date" },
        { key: "preferred_time", label: "Time" },
        { key: "meeting_type", label: "Type" },
        { key: "service", label: "Service" },
        { key: "status", label: "Status" },
        { key: "is_read", label: "Read", render: (r) => (r.is_read ? "✓" : "•") },
      ]}
    />
  ),
});
