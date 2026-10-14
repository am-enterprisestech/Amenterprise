import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/badges")({
  component: () => (
    <CrudTable
      table="badges"
      title="Trust badges"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "label", label: "Label", type: "text", required: true },
        { name: "sublabel", label: "Sub label", type: "text" },
        { name: "icon", label: "Icon (lucide name, e.g. shield-check)", type: "text", required: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "label", label: "Label" },
        { key: "icon", label: "Icon" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
