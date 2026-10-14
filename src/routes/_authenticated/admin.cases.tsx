import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/cases")({
  component: () => (
    <CrudTable
      table="case_studies"
      title="Case studies"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "client", label: "Client name", type: "text" },
        { name: "category", label: "Category", type: "text" },
        { name: "cover_url", label: "Cover image", type: "image" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "results", label: "Results (e.g. +42% sales)", type: "text" },
        { name: "link_url", label: "Case study link", type: "text" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "title", label: "Title" },
        { key: "client", label: "Client" },
        { key: "category", label: "Category" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
