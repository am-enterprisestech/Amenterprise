import { getAttributionData } from "./attribution";
import { sendMetaCapiEvent } from "./meta-capi.functions";

export const META_PIXEL_ID = "1562782738404590";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
  }
}

/** Generate a stable unique event ID for browser + CAPI deduplication. */
export function generateEventId(prefix = "evt"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Push event to Google Tag Manager / GA4 dataLayer. */
export function pushToDataLayer(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

/** Initialize base Meta Pixel script dynamically if not present. */
export function initMetaPixel(pixelId = META_PIXEL_ID): void {
  if (typeof window === "undefined") return;
  if (window.fbq) return;

  const f: any = (window.fbq = function (...args: any[]) {
    if (f.callMethod) {
      f.callMethod.apply(f, args);
    } else {
      f.queue.push(args);
    }
  });

  if (!window._fbq) window._fbq = f;
  f.push = f;
  f.loaded = true;
  f.version = "2.0";
  f.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  window.fbq("init", pixelId);
}

export type TrackMetaEventOptions = {
  isCustom?: boolean;
  userData?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  eventId?: string;
};

/**
 * Universal Meta Event Dispatcher.
 * Fires browser Pixel, triggers server-side CAPI asynchronously, and pushes to GTM dataLayer.
 * Never throws, never blocks UI or navigation.
 */
export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  options: TrackMetaEventOptions = {}
): string {
  if (typeof window === "undefined") return "";

  const eventId = options.eventId || generateEventId(eventName.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const attr = getAttributionData();

  const combinedParams: Record<string, unknown> = {
    ...params,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_content: attr.utm_content,
    utm_term: attr.utm_term,
    fbclid: attr.fbclid,
  };

  // 1. Browser Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      const trackType = options.isCustom ? "trackCustom" : "track";
      window.fbq(trackType, eventName, combinedParams, { eventID: eventId });
    }
  } catch (e) {
    console.warn("[Meta Pixel Warning]", e);
  }

  // 2. GTM / GA4 dataLayer push
  try {
    pushToDataLayer(options.isCustom ? eventName : eventName.toLowerCase(), {
      event_id: eventId,
      ...combinedParams,
    });
  } catch (e) {
    console.warn("[DataLayer Warning]", e);
  }

  // 3. Server-side CAPI dispatch (fire and forget)
  try {
    void sendMetaCapiEvent({
      data: {
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: {
          email: options.userData?.email,
          phone: options.userData?.phone,
          name: options.userData?.name,
          client_user_agent: navigator.userAgent,
        },
        custom_data: combinedParams,
        action_source: "website",
      },
    }).catch((err) => {
      console.warn("[CAPI Background Error]", err);
    });
  } catch (e) {
    console.warn("[CAPI Dispatch Exception]", e);
  }

  return eventId;
}

// Tracked page views map to prevent SPA duplicate firing
const firedPageViews = new Set<string>();

/** Track PageView for route transitions cleanly. */
export function trackPageView(pathname?: string): string {
  if (typeof window === "undefined") return "";
  const currentPath = pathname || window.location.pathname;

  // Deduplicate exact same path in same event cycle if needed
  const eventId = generateEventId("pv");

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView", { path: currentPath }, { eventID: eventId });
    }
  } catch (e) {
    console.warn("[Meta PageView Error]", e);
  }

  pushToDataLayer("page_view", {
    page_path: currentPath,
    event_id: eventId,
  });

  // CAPI for PageView
  void sendMetaCapiEvent({
    data: {
      event_name: "PageView",
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: { client_user_agent: navigator.userAgent },
      custom_data: { path: currentPath },
      action_source: "website",
    },
  }).catch(() => {});

  firedPageViews.add(currentPath);
  return eventId;
}

/** Track ViewContent on key service pages or case studies. */
export function trackViewContent(contentName: string, contentCategory = "Software Services"): string {
  return trackMetaEvent("ViewContent", {
    content_name: contentName,
    content_category: contentCategory,
  });
}

/** Track Contact intent (WhatsApp, Phone, Email clicks). */
export function trackContact(method: "whatsapp" | "phone" | "email", detail?: string): string {
  return trackMetaEvent("Contact", {
    contact_method: method,
    detail: detail || method,
  });
}

/** Track CTA Button clicks (Start Project, Book Call, etc.). */
export function trackCTAClick(ctaLabel: string, location?: string): string {
  return trackMetaEvent(
    "CTAClick",
    {
      cta_label: ctaLabel,
      location: location || "website",
    },
    { isCustom: true }
  );
}

const formStartSessions = new Set<string>();

/** Track LeadFormStart — fired MAX ONCE per form session when user interacts. */
export function trackLeadFormStart(formId: string): string {
  if (formStartSessions.has(formId)) return "";
  formStartSessions.add(formId);

  return trackMetaEvent(
    "LeadFormStart",
    {
      form_id: formId,
    },
    { isCustom: true }
  );
}

/** Track genuine successful Lead form submission. */
export function trackLead(leadData: {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  budget?: string;
  formId?: string;
}): string {
  return trackMetaEvent(
    "Lead",
    {
      content_name: leadData.service || "General Inquiry",
      form_id: leadData.formId || "contact_form",
      budget: leadData.budget || null,
      value: 0,
      currency: "USD",
    },
    {
      userData: {
        email: leadData.email,
        phone: leadData.phone,
        name: leadData.name,
      },
    }
  );
}

/** Track genuine confirmed appointment booking (Schedule). */
export function trackSchedule(bookingData: {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  meetingType?: string;
  date?: string;
  time?: string;
}): string {
  return trackMetaEvent(
    "Schedule",
    {
      booking_type: bookingData.meetingType || "Discovery Call",
      service_type: bookingData.service || "Consultation",
      preferred_date: bookingData.date || null,
      preferred_time: bookingData.time || null,
    },
    {
      userData: {
        email: bookingData.email,
        phone: bookingData.phone,
        name: bookingData.name,
      },
    }
  );
}
