import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/process")({
  component: () => (
    <CrudTable
      table="process_steps"
      title="Process steps"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "step_number", label: "Step number (e.g. 01)", type: "text" },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "step_number", label: "#" },
        { key: "title", label: "Title" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
