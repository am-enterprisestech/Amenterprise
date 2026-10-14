/**
 * src/lib/site.ts
 * Legacy compatibility shim — all values now live in src/lib/brand.ts.
 * This file re-exports everything so existing imports continue to work
 * without any changes.
 */
export {
  SITE_URL,
  SITE_NAME,
  SITE_LOGO,
  SITE_OG_IMAGE,
  PHONE_PK,
  PHONE_UK,
  PHONE_PK_DISPLAY,
  PHONE_UK_DISPLAY,
  EMAIL,
  abs,
  breadcrumbLd,
  BRAND,
} from "./brand";
