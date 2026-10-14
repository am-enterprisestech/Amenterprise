import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/clients")({
  ssr: false,
  // When the user navigates to /clients (no trailing slash) the layout outlet
  // would render nothing because the matched component is this layout, not the
  // /clients/ index child. Redirect to /clients/ so the login page is shown.
  beforeLoad: ({ location }) => {
    if (location.pathname === "/clients") {
      throw redirect({ to: "/clients/", replace: true });
    }
  },
  component: () => <Outlet />,
});
