import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  component: () => (
    <CrudTable
      table="pricing_plans"
      title="Pricing plans"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "name", label: "Plan name", type: "text", required: true },
        { name: "price", label: "Price (e.g. $1,499 / Custom)", type: "text" },
        { name: "price_period", label: "Period (/mo, /project, empty)", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "features", label: "Features", type: "tags", placeholder: "Comma separated" },
        { name: "cta_label", label: "CTA button label", type: "text" },
        { name: "cta_url", label: "CTA link", type: "text" },
        { name: "featured", label: "Highlight as popular", type: "boolean" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "name", label: "Plan" },
        { key: "price", label: "Price" },
        { key: "featured", label: "★", render: (r) => (r.featured ? "★" : "") },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
