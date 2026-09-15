import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { HeroSlider } from "@/components/site/HeroSlider";
import { BentoHome } from "@/components/site/BentoHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AM Enterprises — Digital Ecosystems for Ambitious Businesses" },
      {
        name: "description",
        content:
          "AM Enterprises builds complete digital ecosystems — strategy, design, custom software, integrations and automation — for founders and businesses that want to grow.",
      },
      { property: "og:title", content: "AM Enterprises — Digital Ecosystems for Ambitious Businesses" },
      {
        property: "og:description",
        content:
          "AM Enterprises builds complete digital ecosystems — strategy, design, custom software, integrations and automation — for founders and businesses that want to grow.",
      },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  useApplyPageSeo("/");
  return (
    <div className="bg-white text-espresso">
      <HeroSlider />
      <BentoHome />
    </div>
  );
}
