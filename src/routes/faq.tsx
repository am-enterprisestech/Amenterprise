import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — AM Enterprises" },
      { name: "description", content: "Answers to common questions about working with AM Enterprises — process, pricing, timelines and support." },
      { property: "og:title", content: "FAQ — AM Enterprises" },
      { property: "og:description", content: "Answers to common questions about working with AM Enterprises — process, pricing, timelines and support." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/faq" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How quickly do you respond to enquiries?",
              acceptedAnswer: { "@type": "Answer", text: "We reply to every message within one business day." },
            },
            {
              "@type": "Question",
              name: "What services does AM Enterprises offer?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AM Enterprises builds websites, web applications, mobile products, custom software, ERP and CRM systems, AI automation, cloud infrastructure and digital integrations.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: FAQPage,
});

type Faq = { id: string; question: string; answer: string; category: string | null };

function FAQPage() {
  useApplyPageSeo("/faq");
  const { rows, loading } = useLiveList<Faq>("faqs", { orderBy: { column: "sort_order" } });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);

  const cats = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.category).filter((c): c is string => Boolean(c))))], [rows]);
  const filtered = rows.filter(
    (f) => (cat === "All" || f.category === cat) && (q === "" || (f.question + f.answer).toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader eyebrow="FAQ" title="Common questions, straight answers." description="Can't find what you need? Email info@amenterprise.tech — we reply within one business day." />

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-5 py-3 shadow-soft">
              <Search className="h-4 w-4 text-espresso/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search questions..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                  cat === c ? "bg-cocoa text-white" : "border border-border bg-white text-espresso hover:border-cocoa/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading…</div>
          ) : (
            <div className="mt-8 space-y-3">
              {filtered.map((f, i) => (
                <Reveal key={f.id} delay={i * 40}>
                  <button
                    onClick={() => setOpen(open === f.id ? null : f.id)}
                    className="w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:border-copper"
                  >
                    <div className="flex items-center justify-between gap-4 p-5">
                      <span className="font-display font-bold text-espresso">{f.question}</span>
                      <Plus className={`h-5 w-5 shrink-0 text-cocoa transition ${open === f.id ? "rotate-45" : ""}`} />
                    </div>
                    <div className={`grid transition-all duration-500 ${open === f.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/70">{f.answer}</p>
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-foreground/60">No results — try a different search.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
