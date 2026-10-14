import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDepartment } from "@/departments/registry";
import { DeptPortal } from "@/departments/shared/DeptPortal";

export const Route = createFileRoute("/portal/$dept")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { s?: string } => ({ s: typeof s.s === "string" ? s.s : undefined }),
  beforeLoad: ({ params }) => { if (!getDepartment(params.dept)) throw notFound(); },
  head: () => ({ meta: [{ title: "Department Portal — AM Enterprises" }, { name: "description", content: "Department team portal." }, { property: "og:title", content: "Department Portal — AM Enterprises" }, { property: "og:description", content: "Department team portal." }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Page,
  notFoundComponent: () => <div className="p-12 text-center">Unknown department.</div>,
});

function Page() {
  const { dept } = Route.useParams();
  const { s } = Route.useSearch();
  const d = getDepartment(dept)!;
  return <DeptPortal dept={d} section={s} />;
}
