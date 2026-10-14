import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/about")({
  component: () => (
    <CrudTable
      table="about_blocks"
      title="About Page Blocks"
      orderBy={{ column: "sort_order", ascending: true }}
      defaults={{ layout: "text", published: true, items: [] }}
      fields={[
        { name: "section_key", label: "Section key", type: "text", required: true, placeholder: "e.g. mission", help: "Unique identifier for this block." },
        { name: "layout", label: "Layout", type: "select", options: ["text", "cards", "list", "split"], required: true },
        { name: "eyebrow", label: "Eyebrow", type: "text", placeholder: "Small label above the title" },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "body", label: "Body", type: "textarea", help: "Leave a blank line between paragraphs." },
        { name: "items", label: "Items", type: "tags", help: 'Use "Heading — description" to show a bold lead-in.' },
        { name: "image_url", label: "Image", type: "image" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "title", label: "Title" },
        { key: "section_key", label: "Key" },
        { key: "layout", label: "Layout" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
