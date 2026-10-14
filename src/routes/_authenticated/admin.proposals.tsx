import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/proposals")({
  component: () => (
    <CrudTable
      table="proposals"
      title="Proposals"
      orderBy={{ column: "created_at", ascending: false }}
      defaults={{ status: "draft", currency: "USD", subtotal: 0, discount: 0, total: 0 }}
      fields={[
        { section: "Proposal", name: "title", label: "Title", type: "text", required: true },
        { name: "client_name", label: "Client name", type: "text", required: true },
        { name: "client_email", label: "Client email", type: "text" },
        { name: "currency", label: "Currency", type: "select", options: ["USD", "PKR", "EUR", "GBP"] },
        {
          name: "items", label: "Line items", type: "repeater", itemLabel: "Item",
          subFields: [
            { name: "name", label: "Item", type: "text" },
            { name: "detail", label: "Detail", type: "text" },
            { name: "qty", label: "Qty", type: "number" },
            { name: "price", label: "Price", type: "number" },
          ],
        },
        { name: "subtotal", label: "Subtotal", type: "number" },
        { name: "discount", label: "Discount", type: "number" },
        { name: "total", label: "Total", type: "number" },
        { name: "notes", label: "Notes / terms", type: "textarea" },
        { name: "status", label: "Status", type: "select", options: ["draft", "sent", "viewed", "accepted", "declined"] },
        { name: "valid_until", label: "Valid until (YYYY-MM-DD)", type: "text" },
      ]}
      listColumns={[
        { key: "created_at", label: "Created", render: (r) => new Date(String(r.created_at)).toLocaleDateString() },
        { key: "title", label: "Title" },
        { key: "client_name", label: "Client" },
        { key: "total", label: "Total", render: (r) => `${r.currency} ${Number(r.total ?? 0).toLocaleString()}` },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
