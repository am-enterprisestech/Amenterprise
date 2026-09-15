import { dbInsert } from "@/lib/rest";

const KEY = "aymoxi_sid";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = "";
  try {
    id = window.localStorage.getItem(KEY) ?? "";
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
  } catch {
    id = "anon";
  }
  return id;
}

/** Fire-and-forget analytics event. Never throws, never blocks rendering. */
export function track(event: string, meta: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  void dbInsert("analytics_events", {
    path: window.location.pathname.slice(0, 300),
    event: event.slice(0, 60),
    session_id: sessionId().slice(0, 64),
    referrer: (document.referrer || "").slice(0, 400),
    meta,
  });
}
