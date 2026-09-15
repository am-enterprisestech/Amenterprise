/** Canonical production origin for AM Enterprises. */
export const SITE_URL = "https://www.amenterprise.tech";

export const SITE_NAME = "AM Enterprises";

/** Brand logo — a single physical file served from /public. */
export const SITE_LOGO = `${SITE_URL}/logo.png`;

/** Default social share image. */
export const SITE_OG_IMAGE = `${SITE_URL}/logo.png`;

/** Contact constants */
export const PHONE_PK = "+923173712950";
export const PHONE_UK = "+447717229638";
export const PHONE_PK_DISPLAY = "+92 317 371 2950";
export const PHONE_UK_DISPLAY = "+44 771 722 9638";
export const EMAIL = "info@amenterprise.tech";

/** Build an absolute URL from an app path. */
export function abs(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** BreadcrumbList JSON-LD helper. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}
