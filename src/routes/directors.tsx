import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/directors")({
  component: () => <Outlet />,
});
