import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  component: () => (
    <CrudTable
      table="newsletter_subscribers"
      title="Newsletter subscribers"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[]}
      listColumns={[
        { key: "created_at", label: "Subscribed", render: (r) => new Date(String(r.created_at)).toLocaleString() },
        { key: "email", label: "Email" },
        { key: "source", label: "Source" },
      ]}
    />
  ),
});
