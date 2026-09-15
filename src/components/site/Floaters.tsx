import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Phone, Calendar, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

/* ─── Scroll progress bar ────────────────────────────────────────────────── */

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h     = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />;
}

/* ─── Back to top ────────────────────────────────────────────────────────── */

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-5 z-40 grid h-10 w-10 place-items-center rounded-xl bg-espresso text-white shadow-luxury transition-all lg:bottom-6 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

/* ─── Mobile sticky CTA bar ──────────────────────────────────────────────── */

export function MobileStickyCTA() {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl shadow-luxury lg:hidden">
      <div className="grid grid-cols-4 px-2 py-1.5">
        <a
          href={`tel:${PHONE_PK}`}
          className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-espresso active:bg-sand"
        >
          <Phone className="h-5 w-5 text-cocoa" />
          <span className="text-[10px] font-semibold">Call</span>
        </a>
        <a
          href={`https://wa.me/${PHONE_PK.replace("+", "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-espresso active:bg-sand"
        >
          <MessageCircle className="h-5 w-5 text-cocoa" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>
        <Link
          to="/book"
          className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-espresso active:bg-sand"
        >
          <Calendar className="h-5 w-5 text-cocoa" />
          <span className="text-[10px] font-semibold">Book</span>
        </Link>
        <Link
          to="/contact"
          className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-espresso active:bg-sand"
        >
          <FileText className="h-5 w-5 text-cocoa" />
          <span className="text-[10px] font-semibold">Project</span>
        </Link>
      </div>
    </div>
  );
}
