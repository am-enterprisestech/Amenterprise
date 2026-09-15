import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/stats")({
  component: () => (
    <CrudTable
      table="stats"
      title="Stats counters"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "value", label: "Value (e.g. 250+)", type: "text", required: true },
        { name: "label", label: "Label", type: "text", required: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "value", label: "Value" },
        { key: "label", label: "Label" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
