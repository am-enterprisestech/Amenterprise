import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useState } from "react";
import { InvoiceModal } from "@/components/portal/InvoiceModal";
import { type InvoiceData } from "@/components/portal/InvoiceDocument";
import { Eye, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: AdminInvoicesPage,
});

function AdminInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  return (
    <div>
      <CrudTable
        table="invoices"
        title="Invoices"
        orderBy={{ column: "created_at", ascending: false }}
        defaults={{
          status: "draft",
          currency: "USD",
          subtotal: 0,
          tax: 0,
          total: 0,
          amount_paid: 0,
          items: [{ name: "Professional Consultation & Engineering", hours: 1, price: 500 }],
        }}
        fields={[
          { section: "Invoice Details", name: "number", label: "Invoice number", type: "text", required: true, placeholder: "AM-INV-1001" },
          { name: "client_name", label: "Client name / Contact", type: "text", required: true },
          { name: "client_email", label: "Client email", type: "text" },
          { name: "currency", label: "Currency", type: "select", options: ["USD", "PKR", "EUR", "GBP", "AED"] },
          {
            name: "items",
            label: "Line items",
            type: "repeater",
            itemLabel: "Line Item",
            subFields: [
              { name: "name", label: "Description / Task", type: "text" },
              { name: "hours", label: "Hours / Qty", type: "number" },
              { name: "price", label: "Unit Price", type: "number" },
            ],
          },
          { name: "subtotal", label: "Subtotal", type: "number" },
          { name: "tax", label: "Tax Amount", type: "number" },
          { name: "total", label: "Total Amount", type: "number" },
          { name: "amount_paid", label: "Amount paid", type: "number" },
          { name: "status", label: "Status", type: "select", options: ["draft", "sent", "partial", "paid", "overdue", "void"] },
          { name: "due_date", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD" },
          { name: "notes", label: "Invoice Notes / Terms", type: "textarea" },
        ]}
        listColumns={[
          { key: "number", label: "Invoice #" },
          { key: "client_name", label: "Client" },
          { key: "total", label: "Total", render: (r) => `${r.currency || "USD"} ${Number(r.total ?? 0).toLocaleString()}` },
          { key: "amount_paid", label: "Paid", render: (r) => `${r.currency || "USD"} ${Number(r.amount_paid ?? 0).toLocaleString()}` },
          {
            key: "status",
            label: "Status",
            render: (r) => {
              const s = String(r.status || "draft");
              const isPaid = s === "paid";
              return (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    isPaid ? "bg-emerald-100 text-emerald-700" : s === "overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s}
                </span>
              );
            },
          },
          {
            key: "preview",
            label: "Official Invoice",
            render: (r) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInvoice({
                    id: String(r.id),
                    number: String(r.number || "AM-INV"),
                    client_name: String(r.client_name || "Client"),
                    client_email: r.client_email ? String(r.client_email) : undefined,
                    currency: String(r.currency || "USD"),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items: Array.isArray(r.items) ? (r.items as any) : undefined,
                    subtotal: r.subtotal ? Number(r.subtotal) : undefined,
                    tax: r.tax ? Number(r.tax) : undefined,
                    total: Number(r.total || 0),
                    amount_paid: Number(r.amount_paid || 0),
                    status: String(r.status || "draft"),
                    due_date: r.due_date ? String(r.due_date) : undefined,
                    notes: r.notes ? String(r.notes) : undefined,
                    created_at: r.created_at ? String(r.created_at) : undefined,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Eye className="h-3 w-3" /> Preview &amp; Print
              </button>
            ),
          },
        ]}
      />

      {/* Official Pixel-by-Pixel Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
