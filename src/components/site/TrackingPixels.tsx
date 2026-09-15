import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { dbSelect } from "@/lib/rest";

export type PixelRow = {
  id: string;
  provider: string;
  pixel_id: string | null;
  verification_code: string | null;
  head_code: string | null;
  body_code: string | null;
  enabled: boolean;
};

const MARK = "data-am-pixel";

function addScript(id: string, opts: { src?: string; code?: string; async?: boolean }) {
  if (document.querySelector(`script[${MARK}="${id}"]`)) return;
  const s = document.createElement("script");
  s.setAttribute(MARK, id);
  if (opts.src) {
    s.src = opts.src;
    s.async = opts.async ?? true;
  }
  if (opts.code) s.text = opts.code;
  document.head.appendChild(s);
}

function addMeta(id: string, name: string, content: string) {
  if (document.querySelector(`meta[${MARK}="${id}"]`)) return;
  const m = document.createElement("meta");
  m.setAttribute(MARK, id);
  m.name = name;
  m.content = content;
  document.head.appendChild(m);
}

function addRawHtml(id: string, html: string, target: "head" | "body") {
  if (document.querySelector(`[${MARK}="${id}"]`)) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const root = target === "head" ? document.head : document.body;
  Array.from(wrapper.childNodes).forEach((node) => {
    if (node.nodeName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.text = old.text;
      s.setAttribute(MARK, id);
      root.appendChild(s);
    } else {
      if (node instanceof HTMLElement) node.setAttribute(MARK, id);
      root.appendChild(node);
    }
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function installPixel(p: PixelRow) {
  const pid = (p.pixel_id ?? "").trim();
  const key = p.id;

  switch (p.provider) {
    case "google_analytics": {
      if (!pid) break;
      addScript(`${key}-src`, { src: `https://www.googletagmanager.com/gtag/js?id=${pid}` });
      addScript(`${key}-init`, {
        code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${pid}');`,
      });
      break;
    }
    case "google_tag_manager": {
      if (!pid) break;
      addScript(`${key}-gtm`, {
        code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${pid}');`,
      });
      break;
    }
    case "google_ads": {
      if (!pid) break;
      addScript(`${key}-src`, { src: `https://www.googletagmanager.com/gtag/js?id=${pid}` });
      addScript(`${key}-init`, {
        code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${pid}');`,
      });
      break;
    }
    case "meta_pixel": {
      if (!pid) break;
      addScript(`${key}-fb`, {
        code: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pid}');fbq('track','PageView');`,
      });
      break;
    }
    case "tiktok_pixel": {
      if (!pid) break;
      addScript(`${key}-tt`, {
        code: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${pid}');ttq.page();}(window,document,'ttq');`,
      });
      break;
    }
    case "linkedin_insight": {
      if (!pid) break;
      addScript(`${key}-li`, {
        code: `_linkedin_partner_id="${pid}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`,
      });
      break;
    }
    case "pinterest_tag": {
      if (!pid) break;
      addScript(`${key}-pin`, {
        code: `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${pid}');pintrk('page');`,
      });
      break;
    }
    case "bing_uet": {
      if (!pid) break;
      addScript(`${key}-uet`, {
        code: `(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${pid}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");`,
      });
      break;
    }
    case "snapchat_pixel": {
      if (!pid) break;
      addScript(`${key}-snap`, {
        code: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${pid}');snaptr('track','PAGE_VIEW');`,
      });
      break;
    }
    case "hotjar": {
      if (!pid) break;
      addScript(`${key}-hj`, {
        code: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${JSON.stringify(pid)},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j;a.appendChild(r)})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
      });
      break;
    }
    case "google_site_verification":
      if (p.verification_code || pid) addMeta(`${key}-gsv`, "google-site-verification", (p.verification_code || pid)!);
      break;
    case "bing_site_verification":
      if (p.verification_code || pid) addMeta(`${key}-bsv`, "msvalidate.01", (p.verification_code || pid)!);
      break;
    case "pinterest_site_verification":
      if (p.verification_code || pid) addMeta(`${key}-psv`, "p:domain_verify", (p.verification_code || pid)!);
      break;
    case "facebook_domain_verification":
      if (p.verification_code || pid) addMeta(`${key}-fdv`, "facebook-domain-verification", (p.verification_code || pid)!);
      break;
    default:
      break;
  }

  if (p.head_code) addRawHtml(`${key}-head`, p.head_code, "head");
  if (p.body_code) addRawHtml(`${key}-body`, p.body_code, "body");
}

function trackPageView(pixels: PixelRow[], path: string) {
  const w = window as any;
  pixels.forEach((p) => {
    const pid = (p.pixel_id ?? "").trim();
    if ((p.provider === "google_analytics" || p.provider === "google_ads") && pid && typeof w.gtag === "function") {
      w.gtag("event", "page_view", { page_path: path });
    }
    if (p.provider === "meta_pixel" && typeof w.fbq === "function") w.fbq("track", "PageView");
    if (p.provider === "tiktok_pixel" && w.ttq?.page) w.ttq.page();
    if (p.provider === "pinterest_tag" && typeof w.pintrk === "function") w.pintrk("page");
    if (p.provider === "snapchat_pixel" && typeof w.snaptr === "function") w.snaptr("track", "PAGE_VIEW");
  });
}

export function TrackingPixels() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pixels = useRef<PixelRow[]>([]);
  const ready = useRef(false);
  const firstPath = useRef(pathname);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await dbSelect<PixelRow>("tracking_pixels", {
        select: "id, provider, pixel_id, verification_code, head_code, body_code, enabled",
        eq: { enabled: true },
        order: { column: "sort_order", ascending: true },
      });
      if (cancelled || !data.length) return;
      pixels.current = data as PixelRow[];

      pixels.current.forEach(installPixel);
      ready.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready.current || pathname === firstPath.current) return;
    trackPageView(pixels.current, pathname);
  }, [pathname]);

  return null;
}
