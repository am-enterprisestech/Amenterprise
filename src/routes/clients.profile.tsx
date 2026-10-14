import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";

export const Route = createFileRoute("/clients/profile")({
  head: () => ({
    meta: [
      { title: "My Profile â€” AM Enterprises Client Portal" },
      { name: "description", content: "Update your contact details and portal password." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Profile client={client} />}</PortalShell>,
});

interface C { id: string; avatar_url?: string | null; name: string; email: string; company: string | null; phone: string | null }

function Profile({ client }: { client: C }) {
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company ?? "");
  const [phone, setPhone] = useState(client.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [avatar, setAvatar] = useState<string | null>(client.avatar_url ?? null);
  const [upBusy, setUpBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  async function onFile(file: File) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setErr("Choose an image under 5 MB."); return; }
    setUpBusy(true); setErr(null);
    const path = `clients/${client.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { setErr(error.message); setUpBusy(false); return; }
    const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (data) {
      const { error: e2 } = await supabase.from("portal_clients").update({ avatar_url: data.signedUrl }).eq("id", client.id);
      if (e2) setErr(e2.message); else { setAvatar(data.signedUrl); setMsg("Profile picture updated."); }
    }
    setUpBusy(false);
  }
  const [pw, setPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.from("portal_clients").update({ name: name.trim(), company: company.trim() || null, phone: phone.trim() || null }).eq("id", client.id);
    setBusy(false);
    if (error) setErr(error.message); else setMsg("Profile updated.");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    setPwBusy(true); setPwMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwBusy(false);
    setPw("");
    setPwMsg(error ? error.message : "Password updated.");
  }

  const input = "mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";
  const label = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <div>
      <PortalHeading title="My profile" subtitle="Keep your details up to date" />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">Contact details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground">{name.slice(0, 1)}</div>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={upBusy} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-60">
                {upBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload photo
              </button>
            </div>
            <div><label className={label}>Full name</label><input value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>
            <div><label className={label}>Company</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={input} /></div>
            <div><label className={label}>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} /></div>
            <div><label className={label}>Login email</label><input value={client.email} disabled className={`${input} opacity-60`} /></div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            {msg && <p className="text-xs text-primary">{msg}</p>}
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          </div>
        </form>

        <form onSubmit={savePassword} className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">Change password</h2>
          <div className="space-y-4">
            <div><label className={label}>New password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} /></div>
            {pwMsg && <p className="text-xs text-muted-foreground">{pwMsg}</p>}
            <button disabled={pwBusy} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60">
              {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
