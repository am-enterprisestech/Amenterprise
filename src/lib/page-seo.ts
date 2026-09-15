import { useEffect } from "react";
import { dbSelectOne } from "@/lib/rest";

export type PageSeo = {
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  noindex: boolean | null;
};

function upsertMeta(selector: string, attrName: "name" | "property", key: string, content: string | null) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string | null) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Client-side hook that fetches admin-managed SEO for the given path
 * and overrides the document's meta tags. Works on top of TSS defaults.
 */
export function useApplyPageSeo(path: string) {
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const data = await dbSelectOne<PageSeo>("page_seo", {
        select:
          "path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,noindex",
        eq: { path },
      });
      if (cancelled || !data) return;
      const seo = data as PageSeo;

      if (seo.meta_title) document.title = seo.meta_title;
      upsertMeta('meta[name="description"]', "name", "description", seo.meta_description);
      upsertMeta('meta[name="keywords"]', "name", "keywords", seo.meta_keywords);
      upsertMeta('meta[property="og:title"]', "property", "og:title", seo.og_title ?? seo.meta_title);
      upsertMeta('meta[property="og:description"]', "property", "og:description", seo.og_description ?? seo.meta_description);
      upsertMeta('meta[property="og:image"]', "property", "og:image", seo.og_image);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", seo.og_image);
      upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.og_title ?? seo.meta_title);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.og_description ?? seo.meta_description);
      upsertLink("canonical", seo.canonical_url ?? path);
      if (seo.noindex) upsertMeta('meta[name="robots"]', "name", "robots", "noindex,nofollow");
    }
    run();
    return () => { cancelled = true; };
  }, [path]);
}
