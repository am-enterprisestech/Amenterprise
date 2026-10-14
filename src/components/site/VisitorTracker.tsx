import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { track } from "@/lib/track";

const SRC_KEY = "am_visit_source";
const HEARTBEAT_MS = 45_000;

/** Works out where this visit came from (first page of the session). */
function visitSource(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(SRC_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(window.location.search);
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    let source = q.get("utm_source") || "";
    if (!source) {
      if (q.get("fbclid")) source = "facebook";
      else if (q.get("gclid")) source = "google_ads";
      else if (/facebook|fb\.com/.test(ref)) source = "facebook";
      else if (/instagram/.test(ref)) source = "instagram";
      else if (/google\./.test(ref)) source = "google";
      else if (/bing\./.test(ref)) source = "bing";
      else if (/linkedin|lnkd/.test(ref)) source = "linkedin";
      else if (/t\.co|twitter|x\.com/.test(ref)) source = "twitter";
      else if (/tiktok/.test(ref)) source = "tiktok";
      else if (/whatsapp|wa\.me/.test(ref)) source = "whatsapp";
      else if (ref && ref !== window.location.hostname.replace(/^www\./, "")) source = ref;
      else source = "direct";
    }
    const info: Record<string, string> = { source: source.toLowerCase().slice(0, 60) };
    const campaign = q.get("utm_campaign");
    const medium = q.get("utm_medium");
    const fbclid = q.get("fbclid");
    if (campaign) info.campaign = campaign.slice(0, 100);
    if (medium) info.medium = medium.slice(0, 60);
    if (fbclid) info.fbclid = fbclid.slice(0, 200);
    sessionStorage.setItem(SRC_KEY, JSON.stringify(info));
    return info;
  } catch {
    return { source: "direct" };
  }
}

function device() {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

const PRIVATE = /^\/(admin|clients|staff|portal|auth|dev-auth|seo-auth|gd-auth|smm-auth|pm-auth)/;

/** Records real page views + a heartbeat so the admin can see live visitors. */
export function VisitorTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef("");

  useEffect(() => {
    if (PRIVATE.test(pathname) || last.current === pathname) return;
    last.current = pathname;
    track("page_view", { ...visitSource(), device: device(), title: document.title.slice(0, 120) });
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (PRIVATE.test(window.location.pathname)) return;
      track("heartbeat", { source: visitSource().source });
    }, HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
