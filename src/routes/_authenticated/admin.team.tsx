import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateAMID } from "@/lib/am-id";
import { Loader2, Plus, Trash2, KeyRound, X, UserCheck, Code2, Palette, Search, Share2, Sparkles, ShieldCheck, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: AdminTeamManager,
});

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  am_id?: string;
  phone?: string;
  bio?: string;
  active?: boolean;
  published?: boolean;
  created_at?: string;
  password?: string;
}

const ROLES = [
  { label: "Project Manager", key: "manager", icon: UserCheck, color: "bg-amber-500 text-white" },
  { label: "Developer", key: "developer", icon: Code2, color: "bg-emerald-500 text-white" },
  { label: "UI/UX Designer", key: "designer", icon: Palette, color: "bg-purple-500 text-white" },
  { label: "SEO Specialist", key: "seo", icon: Search, color: "bg-teal-500 text-white" },
  { label: "Social Media Manager", key: "smm", icon: Share2, color: "bg-pink-500 text-white" },
  { label: "Graphic Designer", key: "graphic-designer", icon: Sparkles, color: "bg-orange-500 text-white" },
];

function AdminTeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    // Fetch from staff_members
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: staffData } = await (supabase.from as any)("staff_members")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch from team_members
    const { data: teamData } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });

    const combinedMap = new Map<string, TeamMember>();

    (teamData || []).forEach((t: any) => {
      combinedMap.set(t.email || t.id, {
        id: t.id,
        name: t.name,
        email: t.email || `${t.name.toLowerCase().replace(/\s+/g, ".")}@aymoxi.com`,
        role: t.role_title || t.role || "Team Member",
        department: t.department || "Engineering",
        am_id: generateAMID("staff", t.id),
        active: true,
        published: t.published ?? true,
      });
    });

    (staffData || []).forEach((s: any) => {
      combinedMap.set(s.email || s.id, {
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.job_title || s.role || "Team Member",
        department: s.department || "Engineering",
        am_id: s.am_id || generateAMID("staff", s.id),
        phone: s.phone,
        active: s.active ?? true,
        published: true,
      });
    });

    setMembers(Array.from(combinedMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleToggleStatus = async (m: TeamMember) => {
    const nextActive = !m.active;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("staff_members").update({ active: nextActive }).eq("id", m.id);
      toast.success(`${m.name} is now ${nextActive ? "Active" : "Inactive"}`);
      loadMembers();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleRemove = async (m: TeamMember) => {
    if (!confirm(`Remove ${m.name} from Team & Staff directory?`)) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("staff_members").delete().eq("id", m.id);
      await supabase.from("team_members").delete().eq("id", m.id);
      toast.success(`${m.name} removed from team.`);
      loadMembers();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-espresso/15 bg-slate-950 p-6 text-white shadow-xl">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> AM Enterprise Central Team Management
          </span>
          <h1 className="mt-2 font-display text-2xl font-black text-white">Staff Credentials & Department Roles</h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-xl">
            Create team members with email/password credentials, role-based department permissions, active account statuses, and unique AM IDs.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg transition"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      {/* Team Members Table */}
      <div className="overflow-hidden rounded-3xl border border-espresso/10 bg-white shadow-sm">
        {loading ? (
          <div className="grid place-items-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-cocoa" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-sm text-foreground/50">No team members registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand/60 text-left text-xs font-bold uppercase tracking-wider text-espresso/70">
                <tr>
                  <th className="px-5 py-4">Team Member</th>
                  <th className="px-5 py-4">Permanent AM ID</th>
                  <th className="px-5 py-4">Role & Department</th>
                  <th className="px-5 py-4">Account Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/6">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-sand/30">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-espresso">{m.name}</p>
                        <p className="text-xs text-foreground/60">{m.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-emerald-700">{m.am_id}</td>
                    <td className="px-5 py-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/80 px-3 py-1 font-bold text-espresso">
                        {m.role} · <span className="text-cocoa">{m.department}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                          m.active ?? true
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {m.active ?? true ? "Active Access" : "Inactive / Suspended"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRemove(m)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                        title="Delete team member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {creating && (
        <CreateTeamModal
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            loadMembers();
          }}
        />
      )}
    </div>
  );
}

function CreateTeamModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Developer",
    department: "Engineering",
    active: true,
    phone: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      const generatedId = crypto.randomUUID();
      const amId = generateAMID("staff", generatedId);
      const cleanEmail = form.email.trim().toLowerCase();
      const pass = form.password.trim() || "AMEnterprise2026!";

      // 1. Create Auth account in Supabase
      const { data: authUser, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: form.name,
            role: form.role,
            am_id: amId,
          },
        },
      });

      const finalUserId = authUser?.user?.id || generatedId;

      // 2. Insert into staff_members table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: staffErr } = await (supabase.from as any)("staff_members").insert({
        id: finalUserId,
        name: form.name,
        email: cleanEmail,
        job_title: form.role,
        role: form.role.toLowerCase(),
        department: form.department,
        am_id: amId,
        active: form.active,
        phone: form.phone || null,
        user_id: finalUserId,
      });

      if (staffErr && !staffErr.message.includes("duplicate")) {
        console.warn("Staff Insert Warning:", staffErr);
      }

      // 3. Insert into team_members for website showcase
      await supabase.from("team_members").insert({
        id: finalUserId,
        name: form.name,
        email: cleanEmail,
        role_title: form.role,
        bio: form.bio || `${form.name} is a ${form.role} at AM Enterprise.`,
        published: true,
        sort_order: 1,
      });

      toast.success(`Created Team Account for ${form.name}! AM ID: ${amId}`);
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-espresso/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-black text-espresso">Add New Team Member</h2>
            <p className="text-xs text-foreground/60">Creates live credentials & permanent AM ID.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-sand">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ali Raza"
              className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Work Email (Login ID)</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. ali.developer@aymoxi.com"
              className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Login Password</label>
            <div className="relative mt-1">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="e.g. DevPass2026!"
                className="w-full rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-2.5 pr-10 text-sm outline-none focus:border-cocoa focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-espresso"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-foreground/50">Password for logging into `/staff` portal.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Assigned Role</label>
              <select
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value;
                  let dept = "Engineering";
                  if (role.includes("Designer")) dept = "Product Design";
                  if (role.includes("SEO")) dept = "Search Engine";
                  if (role.includes("Social")) dept = "Growth Marketing";
                  if (role.includes("Graphic")) dept = "Creative Studio";
                  if (role.includes("Manager")) dept = "Management";
                  setForm({ ...form, role, department: dept });
                }}
                className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-3 py-2.5 text-xs font-bold outline-none focus:border-cocoa focus:bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r.key} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-3 py-2.5 text-xs font-bold outline-none focus:border-cocoa focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Account Access Status</label>
            <div className="mt-1.5 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-espresso">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={form.active === true}
                  onChange={() => setForm({ ...form, active: true })}
                  className="accent-emerald-600"
                />
                Active (Can Login)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={form.active === false}
                  onChange={() => setForm({ ...form, active: false })}
                  className="accent-rose-600"
                />
                Suspended (Block Login)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-espresso/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-espresso/15 px-5 py-2.5 text-xs font-bold text-espresso hover:bg-sand"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-white hover:bg-cocoa disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save & Register Staff Account
          </button>
        </div>
      </form>
    </div>
  );
}