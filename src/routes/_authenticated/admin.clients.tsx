import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: () => (
    <CrudTable
      table="clients"
      title="Clients & Logos"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "name", label: "Client name", type: "text", required: true },
        { name: "logo_url", label: "Logo image", type: "image" },
        { name: "website_url", label: "Website URL", type: "text" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "name", label: "Name" },
        { key: "website_url", label: "Site" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
