import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createClientAccount, updateClientCredentials, deleteClientAccount, repairClientLink } from "@/lib/portal.functions";
import { Loader2, Plus, Trash2, KeyRound, X, Users, AlertTriangle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/portal/")({
  component: AdminPortal,
});

interface Client { id: string; name: string; email: string; company: string | null; phone: string | null; active: boolean; user_id: string | null; created_at: string }

const input = "w-full rounded-xl border border-espresso/12 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white";
const label = "text-[10px] font-semibold uppercase tracking-widest text-espresso/60";

function AdminPortal() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useServerFn(createClientAccount);
  const updateCreds = useServerFn(updateClientCredentials);
  const removeAccount = useServerFn(deleteClientAccount);
  const repair = useServerFn(repairClientLink);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: e } = await supabase.from("portal_clients").select("*").order("created_at", { ascending: false });
    if (e) setError(e.message);
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-espresso">Client Portal</h1>
          <p className="text-sm text-foreground/60">{clients.length} portal account{clients.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2.5 text-sm font-bold text-white hover:bg-cocoa">
          <Plus className="h-4 w-4" /> New client account
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-espresso/10 bg-white">
        {loading ? (
          <div className="grid place-items-center p-12"><Loader2 className="h-5 w-5 animate-spin text-cocoa" /></div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-sm text-foreground/50">No client accounts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand/60 text-left text-xs font-bold uppercase tracking-wider text-espresso/70">
                <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Login</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-espresso/6">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/30">
                    <td className="px-4 py-3 font-semibold text-espresso">{c.name}</td>
                    <td className="px-4 py-3 text-espresso/80">{c.email}</td>
                    <td className="px-4 py-3 text-espresso/70">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-espresso/70">
                      {c.user_id ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active login
                        </span>
                      ) : (
                        <button
                          title="Auto-fix portal link"
                          onClick={async () => {
                            try {
                              await repair({ data: { clientId: c.id } });
                              load();
                              alert("Portal link fixed! Client can now log in.");
                            } catch (e) { alert((e as Error).message); }
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-100"
                        >
                          <AlertTriangle className="h-3 w-3" /> No login — Fix
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => { await supabase.from("portal_clients").update({ active: !c.active }).eq("id", c.id); load(); }}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.active ? "bg-green-100 text-green-700" : "bg-espresso/10 text-espresso/60"}`}>
                        {c.active ? "active" : "disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link to="/admin/portal/$clientId" params={{ clientId: c.id }} className="rounded-lg border border-espresso/15 px-3 py-1.5 text-xs font-bold text-espresso hover:bg-sand">Manage</Link>
                        <button
                          onClick={async () => {
                            const pw = prompt(`New password for ${c.email} (min 8 chars)`);
                            if (!pw) return;
                            try { await updateCreds({ data: { clientId: c.id, password: pw } }); alert("Password updated."); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="rounded-lg p-2 text-espresso hover:bg-sand" title="Reset password"><KeyRound className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete ${c.name} and all their portal data?`)) return;
                            try { await removeAccount({ data: { clientId: c.id } }); load(); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onDone={() => { setCreating(false); load(); }} create={create} />}
    </div>
  );
}

function CreateModal({ onClose, onDone, create }: { onClose: () => void; onDone: () => void; create: ReturnType<typeof useServerFn<typeof createClientAccount>> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await create({ data: form }); onDone(); }
    catch (e2) { setErr((e2 as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-espresso">New client account</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-sand"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3">
          {([["name", "Full name"], ["email", "Login email"], ["password", "Temporary password"], ["company", "Company"], ["phone", "Phone"]] as const).map(([k, l]) => (
            <div key={k}>
              <label className={label}>{l}</label>
              <input required={k === "name" || k === "email" || k === "password"} type={k === "password" ? "text" : k === "email" ? "email" : "text"}
                value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`mt-1 ${input}`} />
            </div>
          ))}
        </div>
        {err && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-bold text-espresso">Cancel</button>
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
          </button>
        </div>
      </form>
    </div>
  );
}

