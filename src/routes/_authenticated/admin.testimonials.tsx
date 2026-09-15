import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <CrudTable
      table="testimonials"
      title="Testimonials"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "name", label: "Client name", type: "text", required: true },
        { name: "role_title", label: "Role / Company", type: "text" },
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "stars", label: "Stars (1-5)", type: "number" },
        { name: "avatar_url", label: "Avatar", type: "image" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "name", label: "Name" },
        { key: "role_title", label: "Role" },
        { key: "stars", label: "★" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});