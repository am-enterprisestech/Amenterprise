import { createServerFn } from "@tanstack/react-start";
import { auditInputSchema, normaliseAuditUrl } from "./audit-helpers";
import { safeFetch } from "./audit-guard.server";

export type AuditFinding = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  impact: "high" | "medium" | "low";
};

export type AuditResult = {
  ok: boolean;
  url: string;
  score: number;
  scores: { seo: number; performance: number; security: number; content: number };
  findings: AuditFinding[];
  summary: string;
};

/** Fetches a public page and runs deterministic on-page checks. */
export const runSiteAudit = createServerFn({ method: "POST" })
  .inputValidator((data) => auditInputSchema.parse(data))
  .handler(async ({ data }): Promise<AuditResult> => {
    const target = normaliseAuditUrl(data.url);

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return {
        ok: false,
        url: target,
        score: 0,
        scores: { seo: 0, performance: 0, security: 0, content: 0 },
        findings: [],
        summary: "That doesn't look like a valid website address.",
      };
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        ok: false, url: target, score: 0,
        scores: { seo: 0, performance: 0, security: 0, content: 0 },
        findings: [], summary: "Only http and https addresses can be audited.",
      };
    }

    const started = Date.now();
    let html = "";
    let status = 0;
    let headers = new Headers();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await safeFetch(parsed, {
        signal: controller.signal,
        headers: { "user-agent": "AymoxiSiteAudit/1.0 (+https://www.aymoxi.com)" },
      });
      clearTimeout(timer);
      status = res.status;
      headers = res.headers;
      html = (await res.text()).slice(0, 900_000);
    } catch {
      return {
        ok: false, url: parsed.toString(), score: 0,
        scores: { seo: 0, performance: 0, security: 0, content: 0 },
        findings: [],
        summary: "We couldn't reach that site. Check the address is public and try again.",
      };
    }
    const ms = Date.now() - started;

    const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
    const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const desc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const h1s = html.match(/<h1[\b>][\s\S]*?<\/h1>/gi) ?? [];
    const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
    const imgsNoAlt = imgs.filter((t) => !/\balt\s*=/i.test(t));
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasOg = /property=["']og:(title|image)["']/i.test(html);
    const hasCanonical = /rel=["']canonical["']/i.test(html);
    const hasSchema = /application\/ld\+json/i.test(html);
    const bytes = html.length;
    const words = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2).length;
    const https = parsed.protocol === "https:";
    const hsts = !!headers.get("strict-transport-security");
    const inlineScripts = (html.match(/<script\b(?![^>]*\bsrc=)/gi) ?? []).length;

    const f: AuditFinding[] = [];
    const add = (
      key: string, label: string, ok: boolean | "warn", detail: string,
      impact: AuditFinding["impact"],
    ) => f.push({ key, label, status: ok === true ? "pass" : ok === "warn" ? "warn" : "fail", detail, impact });

    add("reachable", "Page loads successfully", status >= 200 && status < 400,
      `Server responded with HTTP ${status}.`, "high");
    add("title", "Page title", title ? (title.length <= 60 && title.length >= 15 ? true : "warn") : false,
      title ? `"${title}" (${title.length} characters — aim for 15–60).` : "No <title> tag found. Google has nothing to show in results.", "high");
    add("description", "Meta description", desc ? (desc.length <= 160 && desc.length >= 50 ? true : "warn") : false,
      desc ? `${desc.length} characters — aim for 50–160.` : "Missing. Google writes its own snippet, which usually lowers click-through.", "high");
    add("h1", "Single H1 heading", h1s.length === 1 ? true : h1s.length === 0 ? false : "warn",
      h1s.length === 1 ? "Exactly one H1 found — correct." : h1s.length === 0 ? "No H1 heading. Search engines can't tell what the page is about." : `${h1s.length} H1 headings found. Use one.`, "medium");
    add("canonical", "Canonical URL", hasCanonical, hasCanonical ? "Canonical tag present." : "No canonical tag — duplicate URLs can compete against each other.", "medium");
    add("og", "Social share preview", hasOg, hasOg ? "OpenGraph tags found." : "No OpenGraph tags. Links shared on WhatsApp/Facebook/LinkedIn look blank.", "medium");
    add("schema", "Structured data (JSON-LD)", hasSchema, hasSchema ? "Schema markup detected." : "No schema markup — you're missing rich results in Google.", "medium");
    add("viewport", "Mobile viewport", hasViewport, hasViewport ? "Responsive viewport tag present." : "Missing viewport tag — the site will not scale on phones.", "high");
    add("alt", "Image alt text", imgs.length === 0 ? "warn" : imgsNoAlt.length === 0 ? true : "warn",
      imgs.length === 0 ? "No images detected in the HTML." : `${imgsNoAlt.length} of ${imgs.length} images have no alt text.`, "medium");
    add("speed", "Server response time", ms < 800 ? true : ms < 2000 ? "warn" : false,
      `First byte to full HTML took ${ms} ms.`, "high");
    add("weight", "HTML payload size", bytes < 150_000 ? true : bytes < 400_000 ? "warn" : false,
      `${Math.round(bytes / 1024)} KB of HTML.`, "medium");
    add("inline", "Inline scripts", inlineScripts <= 5 ? true : "warn",
      `${inlineScripts} inline <script> blocks — these block rendering.`, "low");
    add("https", "HTTPS encryption", https, https ? "Served over HTTPS." : "Not served over HTTPS. Browsers show a 'Not secure' warning.", "high");
    add("hsts", "HSTS header", hsts, hsts ? "Strict-Transport-Security set." : "No HSTS header — recommended for security hardening.", "low");
    add("content", "Content depth", words >= 500 ? true : words >= 200 ? "warn" : false,
      `About ${words} words of visible copy. Thin pages rarely rank.`, "medium");

    const scoreOf = (keys: string[]) => {
      const set = f.filter((x) => keys.includes(x.key));
      if (!set.length) return 0;
      const got = set.reduce((s, x) => s + (x.status === "pass" ? 1 : x.status === "warn" ? 0.5 : 0), 0);
      return Math.round((got / set.length) * 100);
    };
    const scores = {
      seo: scoreOf(["title", "description", "h1", "canonical", "og", "schema"]),
      performance: scoreOf(["speed", "weight", "inline", "reachable"]),
      security: scoreOf(["https", "hsts"]),
      content: scoreOf(["content", "alt", "viewport"]),
    };
    const score = Math.round(
      scores.seo * 0.35 + scores.performance * 0.3 + scores.security * 0.15 + scores.content * 0.2,
    );

    const failed = f.filter((x) => x.status === "fail").length;
    const summary =
      score >= 85
        ? `Strong foundation — ${score}/100. A few refinements would push this into elite territory.`
        : score >= 60
          ? `Decent but leaking opportunity — ${score}/100, with ${failed} critical issue${failed === 1 ? "" : "s"} to fix.`
          : `Significant problems — ${score}/100. ${failed} critical issue${failed === 1 ? "" : "s"} are actively costing you traffic and leads.`;

    return { ok: true, url: parsed.toString(), score, scores, findings: f, summary };
  });
