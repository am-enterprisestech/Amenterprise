import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: () => (
    <CrudTable
      table="blog_posts"
      title="Blog posts"
      orderBy={{ column: "sort_order", ascending: true }}
      fields={[
        { section: "Post", name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true, placeholder: "url-friendly-name" },
        { name: "excerpt", label: "Excerpt", type: "textarea", help: "Short summary shown on the blog list." },
        { name: "content", label: "Content", type: "textarea", help: "Full article body. Blank lines start new paragraphs." },
        { name: "cover_url", label: "Cover image", type: "image" },
        { name: "author", label: "Author", type: "text" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "boolean" },

        { section: "SEO settings", name: "meta_title", label: "Meta title", type: "text",
          help: "Overrides the page title. Aim for <60 characters." },
        { name: "meta_description", label: "Meta description", type: "textarea",
          help: "Shown in search results. Aim for <160 characters." },
        { name: "meta_keywords", label: "Meta keywords", type: "text" },
        { name: "og_title", label: "Social share title", type: "text" },
        { name: "og_description", label: "Social share description", type: "textarea" },
        { name: "og_image", label: "Social share image", type: "image" },
      ]}
      listColumns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "author", label: "Author" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
      ]}
    />
  ),
});
