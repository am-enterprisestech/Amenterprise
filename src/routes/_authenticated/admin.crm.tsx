import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/crm")({
  component: () => (
    <CrudTable
      table="leads"
      title="CRM — Leads pipeline"
      orderBy={{ column: "created_at", ascending: false }}
      defaults={{ stage: "new", priority: "medium", source: "manual", value_usd: 0 }}
      fields={[
        { section: "Contact", name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text" },
        { name: "company", label: "Company", type: "text" },

        { section: "Deal", name: "service", label: "Service interest", type: "text" },
        { name: "source", label: "Source", type: "select", options: ["manual", "website", "calculator", "audit", "referral", "ads", "social"] },
        { name: "value_usd", label: "Deal value (USD)", type: "number" },
        { name: "stage", label: "Pipeline stage", type: "select", options: ["new", "contacted", "qualified", "proposal", "won", "lost"] },
        { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high"] },
        { name: "next_follow_up", label: "Next follow-up (YYYY-MM-DD)", type: "text" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      listColumns={[
        { key: "created_at", label: "Added", render: (r) => new Date(String(r.created_at)).toLocaleDateString() },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "service", label: "Service" },
        { key: "source", label: "Source" },
        { key: "value_usd", label: "Value", render: (r) => `$${Number(r.value_usd ?? 0).toLocaleString()}` },
        { key: "stage", label: "Stage" },
        { key: "priority", label: "Priority" },
      ]}
    />
  ),
});
