import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { Download } from "lucide-react";

export const Route = createFileRoute("/clients/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Invoices â€” AM Enterprises Client Portal" },
      { name: "description", content: "Review your invoices, payment status and outstanding balance in the AM Enterprises client portal." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Billing clientId={client.id} />}</PortalShell>,
});

interface Invoice {
  id: string; number: string; currency: string; total: number; amount_paid: number; status: string;
  due_date: string | null; paid_at: string | null; items: unknown; share_token: string; created_at: string;
}

export function money(currency: string, n: number) {
  return `${currency === "USD" ? "$" : currency === "PKR" ? "Rs " : currency + " "}${Number(n ?? 0).toLocaleString()}`;
}

function Billing({ clientId }: { clientId: string }) {
  const { rows, loading } = usePortalRows<Invoice>("invoices", clientId, { orderBy: "created_at" });

  const total = rows.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const paid = rows.reduce((s, i) => s + Number(i.amount_paid ?? 0), 0);
  const due = Math.max(0, total - paid);

  return (
    <div>
      <PortalHeading title="Billing" subtitle="Invoices and payment history" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Invoiced", value: total },
          { label: "Paid", value: paid },
          { label: "Outstanding", value: due },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-black text-foreground">${s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {loading ? <EmptyState label="Loading invoicesâ€¦" /> : rows.length === 0 ? <EmptyState label="No invoices yet." /> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Total</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((i) => {
                  const balance = Number(i.total ?? 0) - Number(i.amount_paid ?? 0);
                  return (
                    <tr key={i.id}>
                      <td className="px-4 py-3 font-semibold text-foreground">{i.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.due_date ? new Date(i.due_date).toLocaleDateString() : "â€”"}</td>
                      <td className="px-4 py-3 text-foreground">{money(i.currency, i.total)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{money(i.currency, i.amount_paid)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${balance <= 0 ? "bg-primary/10 text-primary" : i.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                          {balance <= 0 ? "paid" : i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted">
                          <Download className="h-3 w-3" /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
