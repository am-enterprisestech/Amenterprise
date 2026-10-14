import { createFileRoute } from "@tanstack/react-router";
import { DeptAuth } from "@/departments/shared/DeptAuth";
import { projectManagement } from "@/departments/project-management";

export const Route = createFileRoute("/pm-auth")({
  ssr: false,
  head: () => ({ meta: [{ title: `${projectManagement.name} Portal Login — AM Enterprises` }, { name: "description", content: projectManagement.tagline }, { property: "og:title", content: `${projectManagement.name} Portal Login` }, { property: "og:description", content: projectManagement.tagline }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <DeptAuth dept={projectManagement} />,
});
