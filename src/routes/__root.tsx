import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SITE_URL, SITE_LOGO, SITE_OG_IMAGE, PHONE_PK_DISPLAY } from "../lib/site";

import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { BackToTop, MobileStickyCTA, ScrollProgress } from "../components/site/Floaters";
import { FloatingActions } from "../components/site/FloatingActions";
import { TrackingPixels } from "../components/site/TrackingPixels";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Transient failures (stale chunk after a deploy, flaky first request). */
function isTransient(error: Error) {
  const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
  return /dynamically imported module|Importing a module script failed|Failed to fetch|NetworkError|Load failed|ChunkLoadError|error loading|not found/i.test(
    msg,
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const [recovering, setRecovering] = useState(false);

  // Auto-recover once from transient first-load failures instead of showing an error page.
  useEffect(() => {
    if (typeof window === "undefined" || !isTransient(error)) return;
    const KEY = "am_auto_recover";
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    setRecovering(true);
    const t = setTimeout(() => window.location.reload(), 400);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => sessionStorage.removeItem("am_auto_recover"), 8000);
    return () => clearTimeout(t);
  }, []);

  if (recovering) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading AM Enterprises…</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AM Enterprises — Digital Ecosystems for Ambitious Businesses" },
      { name: "description", content: "AM Enterprises builds complete digital ecosystems — strategy, design, software, integrations and automation — for businesses that want to grow." },
      { name: "author", content: "AM Enterprises" },
      { name: "theme-color", content: "#2F8FFF" },
      { property: "og:title", content: "AM Enterprises — Digital Ecosystems for Ambitious Businesses" },
      { property: "og:description", content: "AM Enterprises builds complete digital ecosystems — strategy, design, software, integrations and automation — for businesses that want to grow." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "AM Enterprises" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AM Enterprises — Digital Ecosystems for Ambitious Businesses" },
      { name: "twitter:description", content: "AM Enterprises builds complete digital ecosystems — strategy, design, software, integrations and automation — for businesses that want to grow." },
      { property: "og:image", content: SITE_OG_IMAGE },
      { property: "og:image:alt", content: "AM Enterprises logo" },
      { name: "twitter:image", content: SITE_OG_IMAGE },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "image", href: "/logo.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "AM Enterprises",
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: SITE_LOGO, width: 256, height: 256 },
          image: SITE_LOGO,
          description: "AM Enterprises builds complete digital ecosystems — strategy, design, software, integrations and automation — for businesses that want to grow.",
          telephone: PHONE_PK_DISPLAY,
          email: "info@amenterprise.tech",
          address: [
            {
              "@type": "PostalAddress",
              streetAddress: "Office, 6th Road, Techno City, Blue Area",
              addressLocality: "Islamabad",
              addressCountry: "PK",
            },
            {
              "@type": "PostalAddress",
              name: "Rawat Technology Park",
              addressLocality: "Rawat",
              addressCountry: "PK",
            },
          ],
          founder: [
            { "@type": "Person", name: "Moez Rehman", jobTitle: "Founder & CEO" },
            { "@type": "Person", name: "Ayesha Moez", jobTitle: "Co-Founder & CTO" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: "AM Enterprises",
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChromeless = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/clients");

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingPixels />
      {!isChromeless && <ScrollProgress />}
      {!isChromeless && <Header />}
      <main className="min-h-screen">
        <Outlet />
      </main>
      {!isChromeless && <Footer />}
      {!isChromeless && <BackToTop />}
      {!isChromeless && <FloatingActions />}
      {!isChromeless && <MobileStickyCTA />}
      {!isChromeless && <div className="h-16 lg:hidden" />}
    </QueryClientProvider>
  );
}
