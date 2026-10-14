import { createFileRoute, Link } from "@tanstack/react-router";
import { DEPARTMENTS } from "@/departments/registry";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Department Portals \u2014 AM Enterprises" },
      { name: "description", content: "Select your department to sign in to the AM Enterprises team portal." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalIndex,
});

/** Maps department slug to its auth route path */
const AUTH_ROUTES: Record<string, string> = {
  "web-development": "/dev-auth",
  "seo": "/seo-auth",
  "graphic-design": "/gd-auth",
  "social-media": "/smm-auth",
  "project-management": "/pm-auth",
};

/** Cycle through a set of brand-consistent accent colours */
const ACCENT_COLORS = [
  "#2F8FFF", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EF4444", // red
];

function PortalIndex() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-5 py-16">
      <div className="w-full max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back to site
        </Link>

        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
            Department Portals
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your department to access your team workspace.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {DEPARTMENTS.map((dept, idx) => {
            const authPath = AUTH_ROUTES[dept.slug] ?? "/staff";
            const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const Icon = dept.sections[0]?.icon;

            return (
              <Link
                key={dept.slug}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={authPath as any}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${color}18` }}
                >
                  {Icon
                    ? <Icon className="h-5 w-5" style={{ color }} />
                    : <span className="text-xs font-black" style={{ color }}>{dept.short}</span>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-black text-foreground group-hover:text-primary">
                    {dept.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{dept.tagline}</p>
                </div>
                <LogIn className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
          >
            <LogIn className="h-4 w-4" /> Client Portal
          </Link>
          <Link
            to="/staff"
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
          >
            <LogIn className="h-4 w-4" /> Staff Portal
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Need access?{" "}
          <a href="mailto:info@amenterprise.tech" className="font-bold text-foreground hover:text-primary">
            Contact your administrator
          </a>
        </p>
      </div>
    </div>
  );
}
