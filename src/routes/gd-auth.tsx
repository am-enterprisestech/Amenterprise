import { createFileRoute } from "@tanstack/react-router";
import { DeptAuth } from "@/departments/shared/DeptAuth";
import { graphicDesign } from "@/departments/graphic-design";

export const Route = createFileRoute("/gd-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: `${graphicDesign.name} Portal Login — AM Enterprises` }, { name: "description", content: graphicDesign.tagline }, { property: "og:title", content: `${graphicDesign.name} Portal Login` }, { property: "og:description", content: graphicDesign.tagline }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <DeptAuth dept={graphicDesign} />,
});
