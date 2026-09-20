export type AttributionData = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  captured_at: string;
};

export type FullAttributionPayload = {
  first_touch: AttributionData | null;
  last_touch: AttributionData | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  landing_page: string | null;
  referrer: string | null;
};

const STORAGE_FIRST = "am_attr_first";
const STORAGE_LAST = "am_attr_last";

function safeGet(storage: Storage, key: string): AttributionData | null {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, val: AttributionData): void {
  try {
    storage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage errors
  }
}

/** Initialize attribution on initial page load. */
export function initAttribution(): FullAttributionPayload | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get("utm_source");
  const utm_medium = urlParams.get("utm_medium");
  const utm_campaign = urlParams.get("utm_campaign");
  const utm_content = urlParams.get("utm_content");
  const utm_term = urlParams.get("utm_term");
  const fbclid = urlParams.get("fbclid");
  const gclid = urlParams.get("gclid");
  const ttclid = urlParams.get("ttclid");

  const hasCampaignParams = !!(utm_source || utm_medium || utm_campaign || utm_content || utm_term || fbclid || gclid || ttclid);

  const currentData: AttributionData = {
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null,
    fbclid: fbclid || null,
    gclid: gclid || null,
    ttclid: ttclid || null,
    landing_page: window.location.href,
    referrer: document.referrer || null,
    captured_at: new Date().toISOString(),
  };

  // First touch: Set once if not already present
  let firstTouch = safeGet(localStorage, STORAGE_FIRST);
  if (!firstTouch) {
    firstTouch = currentData;
    safeSet(localStorage, STORAGE_FIRST, currentData);
    safeSet(sessionStorage, STORAGE_FIRST, currentData);
  }

  // Last touch: Update if new campaign parameters exist or no last touch exists
  let lastTouch = safeGet(sessionStorage, STORAGE_LAST);
  if (hasCampaignParams || !lastTouch) {
    lastTouch = currentData;
    safeSet(sessionStorage, STORAGE_LAST, currentData);
    safeSet(localStorage, STORAGE_LAST, currentData);
  }

  return getAttributionData();
}

/** Retrieve current combined attribution data for lead forms and events. */
export function getAttributionData(): FullAttributionPayload {
  if (typeof window === "undefined") {
    return {
      first_touch: null,
      last_touch: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      fbclid: null,
      landing_page: null,
      referrer: null,
    };
  }

  const firstTouch = safeGet(localStorage, STORAGE_FIRST) || safeGet(sessionStorage, STORAGE_FIRST);
  const lastTouch = safeGet(sessionStorage, STORAGE_LAST) || safeGet(localStorage, STORAGE_LAST);

  const active = lastTouch || firstTouch;

  return {
    first_touch: firstTouch,
    last_touch: lastTouch,
    utm_source: active?.utm_source || firstTouch?.utm_source || null,
    utm_medium: active?.utm_medium || firstTouch?.utm_medium || null,
    utm_campaign: active?.utm_campaign || firstTouch?.utm_campaign || null,
    utm_content: active?.utm_content || firstTouch?.utm_content || null,
    utm_term: active?.utm_term || firstTouch?.utm_term || null,
    fbclid: active?.fbclid || firstTouch?.fbclid || null,
    landing_page: active?.landing_page || firstTouch?.landing_page || null,
    referrer: active?.referrer || firstTouch?.referrer || null,
  };
}
