import { createFileRoute } from "@tanstack/react-router";
import { DeptAuth } from "@/departments/shared/DeptAuth";
import { webDevelopment } from "@/departments/web-development";

export const Route = createFileRoute("/dev-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: `${webDevelopment.name} Portal Login — AM Enterprises` }, { name: "description", content: webDevelopment.tagline }, { property: "og:title", content: `${webDevelopment.name} Portal Login` }, { property: "og:description", content: webDevelopment.tagline }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <DeptAuth dept={webDevelopment} />,
});
