import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => (
    <CrudTable
      table="services"
      title="Services"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        // --- Basic ---
        { section: "Basic info", name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug (URL)", type: "text", required: true, placeholder: "e.g. web-development",
          help: "Used as the URL: /services/your-slug" },
        { name: "description", label: "Short description", type: "textarea", required: true,
          help: "Shown on the services grid" },
        { name: "icon", label: "Icon (lucide name)", type: "text", placeholder: "e.g. Code2, Sparkles, Bot" },
        { name: "tags", label: "Tags / bullet points", type: "tags", placeholder: "Comma separated" },
        { name: "gradient", label: "Card style", type: "select", options: ["light", "teal", "dark", "lime", "mesh"] },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "published", label: "Published", type: "boolean" },

        // --- Detail page: Hero / Banner ---
        { section: "Detail page — Hero & Banner", name: "hero_image", label: "Hero image (top of page)", type: "image" },
        { name: "banner_image", label: "Banner image (mid-page background)", type: "image" },
        { name: "long_description", label: "Long description",
          help: "Full body copy. Use blank lines for paragraphs.", type: "textarea" },

        // --- Features ---
        { section: "Detail page — Features", name: "features", label: "Feature bullets", type: "tags",
          help: "Each item is shown as a check-mark feature card." },

        // --- Process ---
        { section: "Detail page — Process steps", name: "process", label: "Process steps", type: "repeater", itemLabel: "Step",
          subFields: [
            { name: "step", label: "Step label", type: "text", placeholder: "01" },
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
          ] },

        // --- Pricing ---
        { section: "Detail page — Pricing", name: "pricing_tiers", label: "Pricing tiers", type: "repeater", itemLabel: "Tier",
          subFields: [
            { name: "name", label: "Plan name", type: "text" },
            { name: "price", label: "Price", type: "text", placeholder: "$999" },
            { name: "period", label: "Period", type: "text", placeholder: "one-time / month" },
            { name: "description", label: "Short description", type: "text" },
            { name: "features", label: "Features (comma separated)", type: "tags" },
            { name: "featured", label: "Featured (highlighted)", type: "boolean" },
            { name: "cta_label", label: "Button label", type: "text", placeholder: "Get started" },
            { name: "cta_url", label: "Button link", type: "text", placeholder: "/contact" },
          ] },

        // --- FAQ ---
        { section: "Detail page — FAQ", name: "faq", label: "FAQ", type: "repeater", itemLabel: "Question",
          subFields: [
            { name: "question", label: "Question", type: "text" },
            { name: "answer", label: "Answer", type: "textarea" },
          ] },

        // --- SEO ---
        { section: "SEO settings", name: "meta_title", label: "Meta title", type: "text",
          help: "Overrides the page title. Aim for <60 characters." },
        { name: "meta_description", label: "Meta description", type: "textarea",
          help: "Shown in search results. Aim for <160 characters." },
        { name: "meta_keywords", label: "Meta keywords", type: "text", placeholder: "web design, saas, next.js" },
        { name: "og_title", label: "Social share title (OG)", type: "text" },
        { name: "og_description", label: "Social share description (OG)", type: "textarea" },
        { name: "og_image", label: "Social share image (OG)", type: "image" },
      ]}
      listColumns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "sort_order", label: "Order" },
        { key: "featured", label: "Featured", render: (r) => (r.featured ? "★" : "") },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
