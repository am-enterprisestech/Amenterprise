import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Eye, Users, Target, Radio, Globe, Flame, Trophy, Loader2, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Live Analytics — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AnalyticsPage,
});

type Ev = { path: string; event: string; session_id: string | null; meta: Record<string, unknown> | null; created_at: string; referrer: string | null };
type Lead = { kind: string; name: string; email: string; phone: string | null; service: string | null; source: string; created_at: string };

const LIVE_WINDOW_MS = 2 * 60 * 1000;

function count<T>(items: T[], key: (t: T) => string | null | undefined) {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = key(i);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [events, setEvents] = useState<Ev[]>([]);
  const [live, setLive] = useState<Ev[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadLive = useCallback(async () => {
    const since = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();
    const { data } = await supabase
      .from("analytics_events")
      .select("path, event, session_id, meta, created_at, referrer")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    setLive((data as Ev[]) ?? []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const [ev, ld, qr, bk, cm, nl] = await Promise.all([
      supabase.from("analytics_events").select("path, event, session_id, meta, created_at, referrer").gte("created_at", since).neq("event", "heartbeat").order("created_at", { ascending: false }).limit(20000),
      supabase.from("leads").select("name, email, phone, service, source, created_at").gte("created_at", since),
      supabase.from("quote_requests").select("name, email, phone, service, created_at").gte("created_at", since),
      supabase.from("bookings").select("name, email, phone, service, created_at").gte("created_at", since),
      supabase.from("contact_messages").select("name, email, subject, created_at").gte("created_at", since),
      supabase.from("newsletter_subscribers").select("email, source, created_at").gte("created_at", since),
    ]);
    if (ev.error) setErr(ev.error.message);
    setEvents((ev.data as Ev[]) ?? []);
    const all: Lead[] = [
      ...(ld.data ?? []).map((r) => ({ kind: "CRM lead", name: r.name, email: r.email, phone: r.phone, service: r.service, source: r.source || "manual", created_at: r.created_at })),
      ...(qr.data ?? []).map((r) => ({ kind: "Quote request", name: r.name, email: r.email, phone: r.phone, service: r.service, source: "quote form", created_at: r.created_at })),
      ...(bk.data ?? []).map((r) => ({ kind: "Booking", name: r.name, email: r.email, phone: r.phone, service: r.service, source: "booking form", created_at: r.created_at })),
      ...(cm.data ?? []).map((r) => ({ kind: "Contact message", name: r.name, email: r.email, phone: null, service: r.subject, source: "contact form", created_at: r.created_at })),
      ...(nl.data ?? []).map((r) => ({ kind: "Newsletter", name: "—", email: r.email, phone: null, service: null, source: r.source || "newsletter", created_at: r.created_at })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at));
    setLeads(all);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    loadLive();
    const id = window.setInterval(loadLive, 10_000);
    return () => window.clearInterval(id);
  }, [loadLive]);

  // Live visitors = unique browsers seen in the last 2 minutes (latest event each).
  const liveVisitors = useMemo(() => {
    const m = new Map<string, Ev>();
    for (const e of live) if (e.session_id && !m.has(e.session_id)) m.set(e.session_id, e);
    return [...m.values()];
  }, [live]);

  const views = events.filter((e) => e.event === "page_view");
  const visitors = new Set(views.map((e) => e.session_id)).size;
  const topPages = count(views, (e) => e.path).slice(0, 10);
  const topEvents = count(events, (e) => e.event).slice(0, 10);
  const sources = count(views, (e) => String(e.meta?.source ?? "direct"));
  const devices = count(views, (e) => (e.meta?.device as string) ?? null);
  const leadSources = count(leads, (l) => l.source);
  const serviceDemand = count(leads, (l) => l.service?.trim() || null).slice(0, 8);
  const serviceViews = count(views.filter((e) => e.path.startsWith("/services/")), (e) => e.path.replace("/services/", "")).slice(0, 8);
  const fbClicks = views.filter((e) => e.meta?.fbclid).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-espresso">Live Analytics</h1>
          <p className="text-sm text-foreground/60">Real visitors and leads from your website, straight from the database.</p>
        </div>
        <div className="flex gap-1 rounded-full border border-espresso/15 bg-white p-1">
          {[1, 7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${days === d ? "bg-espresso text-white" : "text-espresso/70 hover:bg-sand"}`}>
              {d === 1 ? "Today" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{err}</div>}

      {/* Live now */}
      <div className="mb-6 rounded-3xl border border-emerald-300 bg-emerald-50/60 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="font-display text-4xl font-black text-espresso">{liveVisitors.length}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">Visitors on your website right now</p>
          </div>
          <p className="ml-auto text-[11px] text-espresso/60">Refreshes every 10 seconds · active in the last 2 minutes</p>
        </div>
        {liveVisitors.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {liveVisitors.slice(0, 12).map((v) => (
              <div key={v.session_id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="truncate font-semibold text-espresso">{v.path}</span>
                <span className="ml-2 shrink-0 rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold uppercase text-espresso/70">{String(v.meta?.source ?? "direct")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center p-16"><Loader2 className="h-6 w-6 animate-spin text-cocoa" /></div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Target} label="Total leads" value={leads.length} />
            <Stat icon={Users} label="Unique visitors" value={visitors} />
            <Stat icon={Eye} label="Page views" value={views.length} />
            <Stat icon={Activity} label="Visits from Facebook / Instagram ads" value={fbClicks} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel icon={Target} title="Where your leads came from" rows={leadSources} empty="No leads in this period" />
            <Panel icon={Globe} title="Where your visitors came from" rows={sources} empty="No visits yet" />
            <Panel icon={Eye} title="Most visited pages" rows={topPages} empty="No visits yet" />
            <Panel icon={Flame} title="Most fired events" rows={topEvents} empty="No events yet" />
            <Panel icon={Trophy} title="Most requested services (from leads)" rows={serviceDemand} empty="No service requests yet" />
            <Panel icon={Radio} title="Most viewed service pages" rows={serviceViews} empty="No service page visits yet" />
            <Panel icon={Users} title="Devices" rows={devices} empty="No visits yet" />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-espresso/10 bg-white">
            <div className="border-b border-espresso/10 px-4 py-3 font-display font-black text-espresso">Recent leads — contact them</div>
            {leads.length === 0 ? (
              <p className="p-8 text-center text-sm text-foreground/50">No leads in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sand/60 text-left text-xs font-bold uppercase tracking-wider text-espresso/70">
                    <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Service</th><th className="px-4 py-2">Source</th></tr>
                  </thead>
                  <tbody className="divide-y divide-espresso/6">
                    {leads.slice(0, 100).map((l, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-espresso/60">{new Date(l.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2">{l.kind}</td>
                        <td className="px-4 py-2 font-semibold text-espresso">{l.name}</td>
                        <td className="px-4 py-2"><a className="text-cocoa underline" href={`mailto:${l.email}`}>{l.email}</a></td>
                        <td className="px-4 py-2">{l.phone ? <a className="text-cocoa underline" href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{l.phone}</a> : "—"}</td>
                        <td className="px-4 py-2">{l.service || "—"}</td>
                        <td className="px-4 py-2 capitalize">{l.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2 rounded-xl border border-espresso/10 bg-sand/40 p-3 text-xs text-espresso/70">
            <Info className="h-4 w-4 shrink-0" />
            Facebook and Instagram never share a visitor's profile ID with websites (including through the Meta Pixel). To reach people, use the email/phone they submit in your forms above, or run Lead Ads / retargeting audiences inside Meta Ads Manager.
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-espresso/10 bg-white p-5">
      <div className="flex items-center justify-between text-xs font-semibold text-foreground/60"><span>{label}</span><Icon className="h-4 w-4 text-cocoa" /></div>
      <p className="mt-3 font-display text-3xl font-black text-espresso">{value.toLocaleString()}</p>
    </div>
  );
}

function Panel({ icon: Icon, title, rows, empty }: { icon: typeof Eye; title: string; rows: [string, number][]; empty: string }) {
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="rounded-2xl border border-espresso/10 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 font-display font-black text-espresso"><Icon className="h-4 w-4 text-cocoa" />{title}</div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-foreground/50">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-xs"><span className="truncate font-semibold capitalize text-espresso">{k}</span><span className="text-espresso/70">{v}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-cocoa" style={{ width: `${(v / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
