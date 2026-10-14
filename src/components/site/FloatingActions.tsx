import { lazy, Suspense, useEffect, useState } from "react";
import { Bot, Plus, X } from "lucide-react";

const AIChatbot = lazy(() =>
  import("./AIChatbot").then((m) => ({ default: m.AIChatbot }))
);

const PHONE_PK     = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02c-1.75 0-3.47-.47-4.97-1.36l-.36-.21-3.7.97.99-3.61-.23-.37a9.75 9.75 0 0 1-1.5-5.21c0-5.4 4.4-9.79 9.8-9.79 2.62 0 5.08 1.02 6.93 2.87a9.72 9.72 0 0 1 2.87 6.93c0 5.4-4.4 9.78-9.81 9.78M20.5 3.49A11.72 11.72 0 0 0 12.05 0C5.56 0 .28 5.28.28 11.76c0 2.07.54 4.1 1.57 5.88L.18 24l6.5-1.7a11.7 11.7 0 0 0 5.37 1.31h.01c6.48 0 11.76-5.28 11.76-11.76 0-3.14-1.22-6.1-3.44-8.32" />
    </svg>
  );
}

export function FloatingActions() {
  const [expanded, setExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      <div className="fixed bottom-[5.5rem] right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${PHONE_PK.replace("+", "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Chat on WhatsApp — ${PHONE_PK_DISP}`}
          title={PHONE_PK_DISP}
          tabIndex={expanded ? 0 : -1}
          className={`grid h-12 w-12 place-items-center rounded-xl bg-[#25D366] text-white shadow-luxury transition-all duration-300 ease-out ${
            expanded
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-75 opacity-0"
          }`}
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>

        {/* AI Chat */}
        <button
          type="button"
          aria-label="Open AM Enterprises AI assistant"
          tabIndex={expanded ? 0 : -1}
          onClick={() => {
            setChatOpen(true);
            setExpanded(false);
          }}
          className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cocoa to-copper text-white shadow-luxury transition-all delay-75 duration-300 ease-out ${
            expanded
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-75 opacity-0"
          }`}
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* Toggle */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Close quick actions" : "Open quick actions"}
          onClick={() => setExpanded((v) => !v)}
          className="pulse-ring grid h-14 w-14 place-items-center rounded-xl bg-espresso text-white shadow-luxury transition hover:scale-105 active:scale-95"
        >
          {expanded ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {chatOpen && (
        <Suspense fallback={null}>
          <AIChatbot open onClose={() => setChatOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
