import { createFileRoute } from "@tanstack/react-router";
import { DeptAuth } from "@/departments/shared/DeptAuth";
import { socialMedia } from "@/departments/social-media";

export const Route = createFileRoute("/smm-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: `${socialMedia.name} Portal Login — AM Enterprises` }, { name: "description", content: socialMedia.tagline }, { property: "og:title", content: `${socialMedia.name} Portal Login` }, { property: "og:description", content: socialMedia.tagline }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <DeptAuth dept={socialMedia} />,
});
