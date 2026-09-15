import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AM Enterprises" },
      { name: "description", content: "How AM Enterprises collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy — AM Enterprises" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/privacy" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  useApplyPageSeo("/privacy");
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="Last updated: August 2026." />
      <section className="pb-28">
        <div className="mx-auto max-w-3xl px-8">
          <Reveal>
            <article className="space-y-10 text-body-text">
              {[
                {
                  h: "Overview",
                  p: "AM Enterprises respects your privacy. This policy explains what personal data we collect, why we collect it, and how we handle it.",
                },
                {
                  h: "Information we collect",
                  p: "Contact information submitted via forms (name, email, phone, company). Technical data such as IP address, browser type and pages visited, collected via analytics. Cookies to improve site performance and your experience.",
                },
                {
                  h: "How we use it",
                  p: "To respond to enquiries, deliver contracted services and improve our website. We never sell your personal data to third parties.",
                },
                {
                  h: "Data retention",
                  p: "We retain personal data only for as long as necessary to provide services or as required by applicable law.",
                },
                {
                  h: "Your rights",
                  p: "You may request access, correction or deletion of your personal data at any time by emailing info@amenterprise.tech.",
                },
                {
                  h: "Contact",
                  p: "Questions about this policy? Email us at info@amenterprise.tech or write to: AM Enterprises, Office 6th Road, Techno City, Blue Area, Islamabad, Pakistan.",
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
