import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AM Enterprises" },
      { name: "description", content: "The terms that govern use of the AM Enterprises website and professional services." },
      { property: "og:title", content: "Terms of Service — AM Enterprises" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/terms" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  useApplyPageSeo("/terms");
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" description="Last updated: August 2026." />
      <section className="pb-28">
        <div className="mx-auto max-w-3xl px-8">
          <Reveal>
            <article className="space-y-10 text-body-text">
              {[
                {
                  h: "Acceptance",
                  p: "By accessing this website you agree to these terms. If you do not agree, please discontinue use.",
                },
                {
                  h: "Use of services",
                  p: "Our professional services are governed by the master services agreement signed with each client. This website is informational.",
                },
                {
                  h: "Intellectual property",
                  p: "All content on this site is owned by AM Enterprises unless otherwise stated. Reproduction without written permission is prohibited.",
                },
                {
                  h: "Limitation of liability",
                  p: "AM Enterprises is not liable for indirect or consequential damages arising from use of this website.",
                },
                {
                  h: "Governing law",
                  p: "These terms are governed by the laws of England and Wales. For clients in Pakistan, applicable Pakistani law applies concurrently.",
                },
                {
                  h: "Contact",
                  p: "Questions about these terms? Email info@amenterprise.tech or write to AM Enterprises, Office 6th Road, Techno City, Blue Area, Islamabad, Pakistan.",
                },
              ].map((s) => (
                <div key={s.h}>
                  <h2 className="font-display text-2xl font-black text-espresso">{s.h}</h2>
                  <p className="mt-3 text-base leading-relaxed">{s.p}</p>
                </div>
              ))}
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}
