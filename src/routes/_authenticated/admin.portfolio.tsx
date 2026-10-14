import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  component: () => (
    <CrudTable
      table="portfolio"
      title="Portfolio"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "category", label: "Category", type: "text", placeholder: "e.g. SaaS Platform" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image_url", label: "Cover image", type: "image" },
        { name: "link_url", label: "Case study / live link", type: "text" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "sort_order", label: "Order" },
        { key: "featured", label: "Featured", render: (r) => (r.featured ? "★" : "") },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});