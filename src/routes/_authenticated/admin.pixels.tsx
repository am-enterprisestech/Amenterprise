import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/pixels")({
  component: () => (
    <CrudTable
      table="tracking_pixels"
      title="Tracking Pixels"
      orderBy={{ column: "sort_order", ascending: true }}
      defaults={{ enabled: true, sort_order: 0 }}
      fields={[
        {
          section: "Pixel",
          name: "provider",
          label: "Platform",
          type: "select",
          required: true,
          options: [
            "google_analytics",
            "google_tag_manager",
            "google_ads",
            "meta_pixel",
            "tiktok_pixel",
            "linkedin_insight",
            "pinterest_tag",
            "bing_uet",
            "snapchat_pixel",
            "hotjar",
            "google_site_verification",
            "bing_site_verification",
            "pinterest_site_verification",
            "facebook_domain_verification",
            "custom",
          ],
          help: "Pick the platform. Then paste only its ID below — the script loads automatically.",
        },
        { name: "label", label: "Internal label", type: "text", placeholder: "Main GA4 property" },
        {
          name: "pixel_id",
          label: "Pixel / Measurement ID",
          type: "text",
          placeholder: "G-XXXXXXX · GTM-XXXXX · 1234567890 · AW-XXXXXXX · UET tag ID",
          help: "GA4 = G-XXXXXXX, GTM = GTM-XXXXX, Google Ads = AW-XXXXXXX, Meta/TikTok/Pinterest/LinkedIn/Snap = numeric ID, Bing = UET tag ID, Hotjar = site ID.",
        },
        {
          name: "verification_code",
          label: "Verification code",
          type: "text",
          help: "Only for the 'site verification' options — paste the content value from Google/Bing/Pinterest/Facebook.",
        },

        {
          section: "Advanced (optional)",
          name: "head_code",
          label: "Custom <head> code",
          type: "textarea",
          help: "Any extra script/meta HTML to inject in the page head.",
        },
        {
          name: "body_code",
          label: "Custom <body> code",
          type: "textarea",
          help: "Noscript fallbacks or other HTML injected at the end of the body.",
        },

        { section: "Settings", name: "enabled", label: "Enabled (live on site)", type: "boolean" },
        { name: "sort_order", label: "Load order", type: "number" },
      ]}
      listColumns={[
        { key: "provider", label: "Platform" },
        { key: "label", label: "Label" },
        { key: "pixel_id", label: "ID" },
        { key: "enabled", label: "Status", render: (r) => (r.enabled ? "Live" : "Off") },
      ]}
    />
  ),
});
