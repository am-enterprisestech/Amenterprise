import { createFileRoute } from "@tanstack/react-router";
import { DeptAuth } from "@/departments/shared/DeptAuth";
import { seo } from "@/departments/seo";

export const Route = createFileRoute("/seo-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: `${seo.name} Portal Login — AM Enterprises` }, { name: "description", content: seo.tagline }, { property: "og:title", content: `${seo.name} Portal Login` }, { property: "og:description", content: seo.tagline }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <DeptAuth dept={seo} />,
});
