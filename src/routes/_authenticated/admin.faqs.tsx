import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: () => (
    <CrudTable
      table="faqs"
      title="FAQs"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "question", label: "Question", type: "text", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      listColumns={[
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
