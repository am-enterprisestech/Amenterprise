import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface InvoiceItem {
  name: string;
  qty?: number;
  hours?: number;
  price: number;
}

export interface InvoiceData {
  id?: string;
  number: string;
  client_name: string;
  client_company?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string | null;
  currency?: string;
  items?: InvoiceItem[] | null;
  subtotal?: number;
  tax?: number;
  tax_rate?: number;
  total: number;
  amount_paid?: number;
  status: string;
  created_at?: string;
  due_date?: string | null;
  notes?: string | null;
  terms?: string | null;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  company_phone?: string;
  company_email?: string;
}

function formatMoney(currency: string = "USD", amount: number = 0) {
  const sym = currency === "USD" ? "$" : currency === "PKR" ? "Rs " : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${sym}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function InvoiceDocument({
  invoice,
  showWatermark = true,
}: {
  invoice: InvoiceData;
  showWatermark?: boolean;
}) {
  const currency = invoice.currency || "USD";
  const items: InvoiceItem[] = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items
    : [
        {
          name: invoice.notes || "Professional Software Development & Consultation",
          hours: 1,
          price: invoice.subtotal || invoice.total,
        },
      ];

  const subtotal = invoice.subtotal ?? items.reduce((acc, it) => acc + (Number(it.hours || it.qty || 1) * Number(it.price || 0)), 0);
  const taxRate = invoice.tax_rate ?? (invoice.tax && subtotal > 0 ? (invoice.tax / subtotal) * 100 : 5.0);
  const totalTax = invoice.tax ?? (subtotal * (taxRate / 100));
  const total = invoice.total ?? (subtotal + totalTax);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Math.max(0, total - amountPaid);
  const isPaid = balanceDue <= 0 || invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";

  const dateFormatted = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

  const dueDateFormatted = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : dateFormatted;

  return (
    <div
      className="invoice-paper relative mx-auto w-full max-w-[850px] overflow-hidden bg-white text-[#12344D] shadow-2xl transition-all"
      style={{
        minHeight: "1100px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── TOP GEOMETRIC ACCENTS (Pixel-by-pixel match: Black/Midnight Navy Wedge + Brand Blue Ribbon) ── */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 overflow-hidden print:block z-0">
        {/* Full width upper top border line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4BAFE8]" />

        {/* Diagonal Brand Blue Ribbon extending across top right */}
        <div
          className="absolute top-0 right-0 h-20 w-[420px] bg-[#4BAFE8] opacity-95"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 65%, 28% 100%)" }}
        />

        {/* Midnight Navy Sharp Corner Wedge */}
        <div
          className="absolute top-0 right-0 h-24 w-44 bg-[#12344D]"
          style={{ clipPath: "polygon(100% 0, 22% 0, 100% 100%)" }}
        />

        {/* Soft Electric Ice Blue highlight bar */}
        <div
          className="absolute top-0 right-28 h-6 w-56 bg-[#20BFEA]/40"
          style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
        />
      </div>

      {/* ── BOTTOM GEOMETRIC ACCENTS (Pixel-by-pixel match: Black/Midnight Navy Wedge + Brand Blue Ribbon) ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 overflow-hidden print:block z-0">
        {/* Full width lower bottom border line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#4BAFE8]" />

        {/* Diagonal Brand Blue Ribbon extending across bottom left */}
        <div
          className="absolute bottom-0 left-0 h-20 w-[420px] bg-[#4BAFE8] opacity-95"
          style={{ clipPath: "polygon(0 35%, 72% 0, 100% 100%, 0 100%)" }}
        />

        {/* Midnight Navy Sharp Corner Wedge */}
        <div
          className="absolute bottom-0 left-0 h-24 w-44 bg-[#12344D]"
          style={{ clipPath: "polygon(0 100%, 78% 100%, 0 0)" }}
        />

        {/* Soft Electric Ice Blue highlight bar */}
        <div
          className="absolute bottom-0 left-28 h-6 w-56 bg-[#20BFEA]/40"
          style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
      </div>

      {/* Watermark Stamp */}
      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] select-none z-0">
          <span className="text-9xl font-black uppercase tracking-widest text-[#12344D] -rotate-25 font-serif">
            {isPaid ? "PAID" : isOverdue ? "OVERDUE" : "OFFICIAL"}
          </span>
        </div>
      )}

      {/* ── MAIN INVOICE BODY ── */}
      <div className="relative z-10 px-10 py-12 sm:px-16 sm:py-16 flex flex-col justify-between" style={{ minHeight: "1100px" }}>
        <div>
          {/* ── TOP HEADER ROW ── */}
          <div className="flex flex-wrap items-start justify-between gap-6 pt-6">
            {/* Left: Your Company Name & Address */}
            <div className="max-w-xs space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-[#12344D]">
                {invoice.company_name || "AM Enterprises"}
              </h1>
              <div className="pt-2 text-xs leading-relaxed text-[#4B6475] sm:text-[13px] font-sans">
                <p>{invoice.company_address || "Office #402, Business Center Avenue"}</p>
                <p>{invoice.company_city || "Islamabad / Lahore, Pakistan"}</p>
                <p className="mt-1">
                  <span className="font-semibold text-[#12344D]">Phone:</span>{" "}
                  {invoice.company_phone || "+92 317 371 2950"}
                </p>
                <p>
                  <span className="font-semibold text-[#12344D]">Email:</span>{" "}
                  {invoice.company_email || "billing@amenterprise.tech"}
                </p>
              </div>
            </div>

            {/* Right: INVOICE Title & Meta */}
            <div className="text-right sm:pr-4">
              <h2
                className="font-serif text-5xl sm:text-6xl font-black tracking-tight text-[#12344D]"
                style={{ letterSpacing: "-0.04em" }}
              >
                INVOICE
              </h2>
              <div className="mt-4 space-y-1.5 text-xs text-[#12344D] sm:text-[13px] font-sans">
                <div className="flex justify-end gap-3 font-semibold">
                  <span className="uppercase tracking-wider text-[#4B6475] font-serif">INVOICE NO.</span>
                  <span className="font-mono font-black text-[#12344D]">#{invoice.number}</span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="uppercase tracking-wider text-[#4B6475] font-serif">DATE</span>
                  <span className="font-semibold font-mono">{dateFormatted}</span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="uppercase tracking-wider text-[#4B6475] font-serif">DUE DATE</span>
                  <span className="font-semibold font-mono">{dueDateFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BILL TO SECTION ── */}
          <div className="mt-12 max-w-sm">
            <h3 className="font-serif text-sm font-black uppercase tracking-wider text-[#12344D]">
              BILL TO
            </h3>
            <div className="mt-2 space-y-0.5 text-xs text-[#4B6475] sm:text-[13px] leading-relaxed font-sans">
              {invoice.client_company && (
                <p className="font-bold text-[#12344D] text-sm">{invoice.client_company}</p>
              )}
              <p className={invoice.client_company ? "font-medium text-[#12344D]" : "font-bold text-[#12344D] text-sm"}>
                {invoice.client_name}
              </p>
              {invoice.client_address && <p>{invoice.client_address}</p>}
              {invoice.client_phone && <p>Phone: {invoice.client_phone}</p>}
              {invoice.client_email && <p>Email: {invoice.client_email}</p>}
            </div>
          </div>

          {/* ── LINE ITEMS TABLE (Solid Brand Ice-Blue Header matching uploaded blueprint) ── */}
          <div className="mt-10 overflow-hidden rounded-md border border-[#CDE8FB]">
            {/* Table Header Bar: Ice-Blue Solid Strip */}
            <div className="flex items-center bg-[#DDF2FF] px-4 py-3 text-xs font-black uppercase tracking-wider text-[#12344D] border-b border-[#CDE8FB]">
              <div className="flex-1 text-left font-serif">DESCRIPTION</div>
              <div className="w-20 text-center font-serif">HOURS</div>
              <div className="w-28 text-right font-serif">PRICE</div>
              <div className="w-28 text-right font-serif">AMOUNT</div>
            </div>

            {/* Table Line Items */}
            <div className="divide-y divide-[#EAF7FF]">
              {items.map((item, idx) => {
                const qty = Number(item.hours ?? item.qty ?? 1);
                const price = Number(item.price || 0);
                const amount = qty * price;
                return (
                  <div
                    key={idx}
                    className="flex items-center px-4 py-4 text-xs text-[#12344D] sm:text-[13px] hover:bg-[#F8FCFF] transition-colors"
                  >
                    <div className="flex-1 font-medium pr-3">{item.name}</div>
                    <div className="w-20 text-center font-mono text-[#4B6475]">{qty}</div>
                    <div className="w-28 text-right font-mono">{formatMoney(currency, price)}</div>
                    <div className="w-28 text-right font-mono font-bold text-[#12344D]">{formatMoney(currency, amount)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TOTALS CALCULATION (Right Aligned with Highlighted Bar) ── */}
          <div className="mt-8 flex flex-col items-end">
            <div className="w-full max-w-xs space-y-2.5 text-xs sm:text-[13px]">
              {/* Subtotal */}
              <div className="flex items-center justify-between px-2 text-[#4B6475]">
                <span className="font-bold uppercase tracking-wider font-serif">SUBTOTAL</span>
                <span className="font-mono font-semibold text-[#12344D]">{formatMoney(currency, subtotal)}</span>
              </div>

              {/* Tax Rate */}
              <div className="flex items-center justify-between px-2 text-[#4B6475]">
                <span className="font-bold uppercase tracking-wider font-serif">TAX RATE</span>
                <span className="font-mono text-[#12344D]">{Number(taxRate).toFixed(2)}%</span>
              </div>

              {/* Total Tax */}
              <div className="flex items-center justify-between px-2 text-[#4B6475]">
                <span className="font-bold uppercase tracking-wider font-serif">TOTAL TAX</span>
                <span className="font-mono font-semibold text-[#12344D]">{formatMoney(currency, totalTax)}</span>
              </div>

              {/* Solid Highlighted TOTAL Bar matching uploaded blueprint */}
              <div className="mt-3 flex items-center justify-between rounded bg-[#DDF2FF] border border-[#CDE8FB] px-4 py-3 text-sm font-bold text-[#12344D] sm:text-base">
                <span className="font-serif font-black tracking-wider">TOTAL</span>
                <span className="font-mono font-black text-base sm:text-lg text-[#12344D]">
                  {formatMoney(currency, total)}
                </span>
              </div>

              {/* Paid / Outstanding info if applicable */}
              {amountPaid > 0 && (
                <div className="flex items-center justify-between px-2 pt-1 text-xs text-emerald-700">
                  <span className="font-semibold">Paid to date:</span>
                  <span className="font-mono font-bold">-{formatMoney(currency, amountPaid)}</span>
                </div>
              )}
              {balanceDue > 0 && amountPaid > 0 && (
                <div className="flex items-center justify-between px-2 pt-1 text-xs font-bold text-amber-700">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatMoney(currency, balanceDue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TERMS & FOOTER ── */}
        <div className="mt-16 pt-8 border-t border-[#D8EAF3]">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-6">
            {/* Terms on Left */}
            <div className="max-w-md">
              <h4 className="font-serif text-xs font-black uppercase tracking-wider text-[#12344D]">
                TERMS
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#4B6475] font-sans">
                {invoice.terms ||
                  "Payment is due within 14 days of invoice date. All transfers must quote the invoice number. For bank account details or questions, contact billing@amenterprise.tech."}
              </p>
            </div>

            {/* Thank You Note on Right */}
            <div className="text-right">
              <p className="font-serif italic text-base sm:text-xl font-medium text-[#12344D]">
                Thank you for your business!
              </p>
            </div>
          </div>

          {/* Official Verification Strip */}
          <div className="flex items-center justify-between text-[11px] text-[#4B6475] pt-3 border-t border-[#EAF7FF]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#12344D]">Status:</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800"
                    : isOverdue
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isPaid ? <CheckCircle2 className="h-3 w-3" /> : isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {isPaid ? "Paid in full" : isOverdue ? "Overdue" : "Pending Payment"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px]">Verified Hash: {invoice.id ? invoice.id.slice(0, 16) : "AM-OFFICIAL-DOC"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
