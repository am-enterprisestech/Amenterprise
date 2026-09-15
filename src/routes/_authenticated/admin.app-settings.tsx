import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, Smartphone, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit-logger";

export const Route = createFileRoute("/_authenticated/admin/app-settings")({
  head: () => ({
    meta: [{ title: "App Branding & PWA Settings — Admin" }],
  }),
  component: AdminAppSettings,
});

function AdminAppSettings() {
  const [appName, setAppName] = useState("AM Enterprises");
  const [appShortName, setAppShortName] = useState("AM Enterprise");
  const [appIconUrl, setAppIconUrl] = useState("/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.png");
  const [themeColor, setThemeColor] = useState("#2F8FFF");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [installMessage, setInstallMessage] = useState(
    "Install AM Enterprise Web App on your home screen for quick access and instant notifications!"
  );
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("app_settings").select("*").eq("key", "main").maybeSingle();
    if (data) {
      setAppName(data.app_name || "AM Enterprises");
      setAppShortName(data.app_short_name || "AM Enterprise");
      setAppIconUrl(data.app_icon_url || "/logo.png");
      setFaviconUrl(data.favicon_url || "/favicon.png");
      setThemeColor(data.theme_color || "#2F8FFF");
      setBackgroundColor(data.background_color || "#FFFFFF");
      setInstallMessage(data.install_message || "Install AM Enterprise Web App on your home screen...");
    }
    setLoaded(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      key: "main",
      app_name: appName,
      app_short_name: appShortName,
      app_icon_url: appIconUrl,
      favicon_url: faviconUrl,
      theme_color: themeColor,
      background_color: backgroundColor,
      install_message: installMessage,
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from as any)("app_settings").upsert(payload, { onConflict: "key" });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("App Branding & PWA Settings saved successfully!");

      // Update current document favicon & title dynamically
      const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (faviconLink) faviconLink.href = faviconUrl;

      const themeMeta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (themeMeta) themeMeta.content = themeColor;

      logAudit({
        actorId: "admin",
        actorName: "System Admin",
        actorRole: "admin",
        action: "update_app_settings",
        targetType: "app_settings",
        details: `Updated app icon (${appIconUrl}) & theme color (${themeColor})`,
      });
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-espresso via-cocoa to-espresso p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sand">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" /> PWA App Branding & Icon Configurator
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">Installed App & Icon Settings</h1>
            <p className="mt-1 text-xs text-sand/70">Configure custom app icon, app name, theme color, and install notification prompt banner.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-display text-lg font-black text-espresso">App Branding Configuration</h2>

          <div>
            <label className="text-[10px] font-semibold uppercase text-espresso/60">Application Full Name</label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase text-espresso/60">App Short Name (Home Screen Icon Label)</label>
            <input
              type="text"
              required
              value={appShortName}
              onChange={(e) => setAppShortName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase text-espresso/60">App Icon Image URL (PWA & Installation)</label>
            <input
              type="text"
              required
              value={appIconUrl}
              onChange={(e) => setAppIconUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase text-espresso/60">Favicon URL</label>
            <input
              type="text"
              required
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase text-espresso/60">Theme Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-espresso/15 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-espresso/60">Background Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-espresso/15 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-xs font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase text-espresso/60">PWA Install Prompt Message</label>
            <textarea
              rows={3}
              value={installMessage}
              onChange={(e) => setInstallMessage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3 text-xs font-bold text-white hover:bg-cocoa shadow-md transition"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving Branding..." : "Save App Branding Settings"}
          </button>
        </div>

        {/* Live Installed App Preview Mockup */}
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-black text-espresso mb-4">Mobile App Mockup Preview</h2>

            <div className="mx-auto w-64 rounded-[40px] border-4 border-espresso bg-slate-950 p-4 text-white shadow-2xl space-y-4">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                <span>9:41</span>
                <span className="h-2 w-12 rounded-full bg-zinc-800" />
                <span>100%</span>
              </div>

              {/* App Icon Mockup */}
              <div className="my-8 text-center space-y-3">
                <div
                  className="mx-auto grid h-20 w-20 place-items-center rounded-2xl shadow-xl border border-white/20 transition-all"
                  style={{ backgroundColor: themeColor }}
                >
                  <img src={appIconUrl} alt="App Icon" className="h-12 w-12 object-contain" onError={(e) => (e.currentTarget.src = "/logo.png")} />
                </div>
                <p className="font-display text-sm font-black tracking-tight">{appShortName}</p>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold text-emerald-400">PWA Installed</span>
              </div>

              {/* Installation Prompt Banner Mockup */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-3 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-espresso grid place-items-center text-[10px] font-black">AM</div>
                  <p className="text-[11px] font-bold text-zinc-200">Install {appShortName}</p>
                </div>
                <p className="text-[9px] text-zinc-400 line-clamp-2">{installMessage}</p>
                <div className="rounded-full bg-white text-slate-950 py-1 text-center text-[10px] font-black">Install Now</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-espresso/10 bg-sand/30 p-4 text-center">
            <p className="text-xs text-espresso/70">When users open the app on mobile or desktop, this icon and brand theme will automatically apply.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
