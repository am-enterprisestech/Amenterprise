import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StaffShell, StaffHeading } from "@/components/portal/StaffShell";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, STAFF_MODULES } from "@/lib/staff-roles";
import type { StaffMember } from "@/lib/use-staff";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/staff/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — AYMOXI Team Portal" },
      { name: "description", content: "Update your contact details and change your portal password." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="profile">{(staff) => <Profile staff={staff} />}</StaffShell>,
});

const input = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";
const label = "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground";

function Profile({ staff }: { staff: StaffMember }) {
  const [form, setForm] = useState({ name: staff.name, phone: staff.phone ?? "", job_title: staff.job_title ?? "", department: staff.department ?? "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("staff_members").update({
      name: form.name,
      phone: form.phone || null,
      job_title: form.job_title || null,
      department: form.department || null,
    }).eq("id", staff.id);
    setMsg(error ? error.message : "Profile saved.");
    setBusy(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : "Password updated.");
    if (!error) setPw("");
  }

  return (
    <div>
      <StaffHeading title="My profile" subtitle={`${roleLabel(staff.role)} · ${staff.email}`} />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">Details</h2>
          <div className="grid gap-3">
            <div><label className={label}>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></div>
            <div><label className={label}>Job title</label><input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className={input} /></div>
            <div><label className={label}>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={input} /></div>
            <div><label className={label}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} /></div>
          </div>
          {msg && <p className="mt-3 text-xs font-semibold text-primary">{msg}</p>}
          <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
        </form>

        <div className="space-y-6">
          <form onSubmit={changePassword} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">Password</h2>
            <label className={label}>New password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} placeholder="At least 8 characters" />
            {pwMsg && <p className="mt-3 text-xs font-semibold text-primary">{pwMsg}</p>}
            <button className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted">Update password</button>
          </form>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">Your access</h2>
            <div className="flex flex-wrap gap-2">
              {STAFF_MODULES.filter((m) => staff.modules?.includes(m.key)).map((m) => (
                <span key={m.key} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{m.label}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Access is managed by your administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
