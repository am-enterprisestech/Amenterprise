import React, { useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function PwaInstallBanner() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("AM Enterprise PWA Installed successfully!");
      }
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      toast.info("PWA is already installed or supported natively on your device/browser.");
    }
  };

  if (!visible) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 p-5 text-white shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg font-black font-display text-lg">
            AM
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3 w-3" /> Progressive Web App (PWA)
            </span>
            <h3 className="font-display text-base font-black text-white">Install AM Enterprise Desktop/Mobile App</h3>
            <p className="text-xs text-zinc-400">Install for offline access, real-time push notifications, and high performance.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={installApp}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg transition"
          >
            <Download className="h-4 w-4" /> Install App Now
          </button>
          <button
            onClick={() => setVisible(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
