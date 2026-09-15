import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: () => (
    <CrudTable
      table="page_seo"
      title="Page SEO"
      orderBy={{ column: "path", ascending: true }}
      fields={[
        { section: "Page", name: "path", label: "Page path", type: "text", required: true,
          placeholder: "/, /about, /services…", help: "Which URL these settings apply to (start with /)." },
        { name: "label", label: "Internal label", type: "text", required: true, placeholder: "Home / About / …" },

        { section: "SEO", name: "meta_title", label: "Meta title", type: "text",
          help: "Shown in the browser tab and Google results. Aim for <60 characters." },
        { name: "meta_description", label: "Meta description", type: "textarea",
          help: "Shown under the title in Google results. Aim for <160 characters." },
        { name: "meta_keywords", label: "Meta keywords", type: "text",
          placeholder: "web design, saas, ai" },
        { name: "canonical_url", label: "Canonical URL", type: "text",
          placeholder: "https://your-domain.com/page", help: "Leave blank to use the page's own URL." },
        { name: "noindex", label: "Hide from search engines", type: "boolean" },

        { section: "Social sharing (OpenGraph / Twitter)", name: "og_title", label: "Share title", type: "text" },
        { name: "og_description", label: "Share description", type: "textarea" },
        { name: "og_image", label: "Share image (1200×630)", type: "image" },
      ]}
      listColumns={[
        { key: "label", label: "Page" },
        { key: "path", label: "Path" },
        { key: "meta_title", label: "Meta title" },
        { key: "noindex", label: "Hidden", render: (r) => (r.noindex ? "hidden" : "") },
      ]}
    />
  ),
});
