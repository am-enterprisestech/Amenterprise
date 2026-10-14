import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: () => (
    <CrudTable
      table="invoices"
      title="Invoices"
      orderBy={{ column: "created_at", ascending: false }}
      defaults={{ status: "draft", currency: "USD", subtotal: 0, tax: 0, total: 0, amount_paid: 0 }}
      fields={[
        { section: "Invoice", name: "number", label: "Invoice number", type: "text", required: true, placeholder: "INV-0001" },
        { name: "client_name", label: "Client name", type: "text", required: true },
        { name: "client_email", label: "Client email", type: "text" },
        { name: "currency", label: "Currency", type: "select", options: ["USD", "PKR", "EUR", "GBP"] },
        {
          name: "items", label: "Line items", type: "repeater", itemLabel: "Item",
          subFields: [
            { name: "name", label: "Description", type: "text" },
            { name: "qty", label: "Qty", type: "number" },
            { name: "price", label: "Unit price", type: "number" },
          ],
        },
        { name: "subtotal", label: "Subtotal", type: "number" },
        { name: "tax", label: "Tax", type: "number" },
        { name: "total", label: "Total", type: "number" },
        { name: "amount_paid", label: "Amount paid", type: "number" },
        { name: "status", label: "Status", type: "select", options: ["draft", "sent", "partial", "paid", "overdue", "void"] },
      ]}
      listColumns={[
        { key: "number", label: "No." },
        { key: "client_name", label: "Client" },
        { key: "total", label: "Total", render: (r) => `${r.currency} ${Number(r.total ?? 0).toLocaleString()}` },
        { key: "amount_paid", label: "Paid", render: (r) => `${r.currency} ${Number(r.amount_paid ?? 0).toLocaleString()}` },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
