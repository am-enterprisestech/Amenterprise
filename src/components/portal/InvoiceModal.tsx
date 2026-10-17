import React, { useEffect } from "react";
import { InvoiceDocument, type InvoiceData } from "./InvoiceDocument";
import { X, Printer, Download, CreditCard, CheckCircle2 } from "lucide-react";

export function InvoiceModal({
  invoice,
  onClose,
  onPay,
}: {
  invoice: InvoiceData | null;
  onClose: () => void;
  onPay?: (invoice: InvoiceData) => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!invoice) return null;

  function handlePrint() {
    window.print();
  }

  const balance = Number(invoice.total || 0) - Number(invoice.amount_paid || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 print:p-0 print:bg-white print:static print:z-auto print:overflow-visible">
      {/* ── Print Specific Stylesheet ── */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-printable, .invoice-printable * {
            visibility: visible;
          }
          .invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden print:max-h-none print:w-full print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Header Bar */}
        <div className="no-print flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-foreground text-base sm:text-lg">
              Official Invoice #{invoice.number}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                invoice.status === "paid" || balance <= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {invoice.status === "paid" || balance <= 0 ? "Paid" : "Due"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-primary" />
              <span>Print / PDF</span>
            </button>

            {onPay && balance > 0 && (
              <button
                onClick={() => onPay(invoice)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Pay / Submit Proof</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/20 print:p-0 print:bg-white print:overflow-visible">
          <div className="invoice-printable">
            <InvoiceDocument invoice={invoice} />
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="no-print flex items-center justify-between border-t border-border bg-card px-6 py-3 text-xs text-muted-foreground">
          <span>AM Enterprises Premier Invoice Engine</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <Download className="h-3 w-3" /> Download Printable Copy
          </button>
        </div>
      </div>
    </div>
  );
}
