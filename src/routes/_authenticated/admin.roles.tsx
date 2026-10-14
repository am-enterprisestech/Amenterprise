import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import {
  getManagerAccounts,
  createManagerAccount,
  updateManagerAccount,
  deleteManagerAccount,
} from "@/lib/manager.functions";
import {
  MANAGER_MODULES,
  ROLE_PRESETS,
  getRoleBadgeClass,
  type RolePreset,
} from "@/lib/manager-rbac";
import {
  ShieldCheck,
  Plus,
  KeyRound,
  Trash2,
  Edit3,
  ExternalLink,
  Loader2,
  X,
  Search,
  Check,
  Lock,
  Eye,
  Sliders,
  Sparkles,
  Users,
  Radar,
  CalendarCheck,
  MessageSquare,
  FileSignature,
  Target,
  GitBranch,
  Mail,
  BookOpen,
  Briefcase,
  Wrench,
  Star,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & RBAC — AM Enterprises Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRolesPage,
});

interface StaffRow {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  role: string;
  department: string | null;
  modules: string[];
  active: boolean;
  user_id: string | null;
  created_at: string;
}

const MODULE_ICONS: Record<string, typeof Radar> = {
  analytics: Radar,
  bookings: CalendarCheck,
  messages: MessageSquare,
  quotes: FileSignature,
  pixels: Target,
  crm: GitBranch,
  newsletter: Mail,
  blog: BookOpen,
  portfolio: Briefcase,
  services: Wrench,
  testimonials: Star,
  faqs: HelpCircle,
};

function AdminRolesPage() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleTitle, setFormRoleTitle] = useState("Social Media & Ads Specialist");
  const [formRoleKey, setFormRoleKey] = useState("smm");
  const [formDepartment, setFormDepartment] = useState("Marketing & Ads");
  const [formAccessLevel, setFormAccessLevel] = useState<"view" | "manage">("view");
  const [formModules, setFormModules] = useState<string[]>([
    "analytics",
    "bookings",
    "messages",
    "quotes",
    "pixels",
  ]);

  const fetchManagersFn = useServerFn(getManagerAccounts);
  const createFn = useServerFn(createManagerAccount);
  const updateFn = useServerFn(updateManagerAccount);
  const deleteFn = useServerFn(deleteManagerAccount);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchManagersFn();
      if (res?.rows) {
        setRows(res.rows);
      }
    } catch (e) {
      console.warn("fetchManagersFn error, falling back to direct query:", e);
      const { data, error: err } = await supabase
        .from("staff_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) setError(err.message);
      else setRows((data as StaffRow[]) ?? []);
    }
    setLoading(false);
  }, [fetchManagersFn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    applyPreset(ROLE_PRESETS[0]); // SMM default preset
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const openEditModal = (staff: StaffRow) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPassword("");
    setFormRoleTitle(staff.job_title || "Portal Manager");
    setFormRoleKey(staff.role || "manager");
    setFormDepartment(staff.department || "Operations");
    setFormModules(Array.isArray(staff.modules) ? staff.modules : ["analytics"]);
    setFormAccessLevel(
      staff.role.toLowerCase().includes("smm") ? "view" : "manage",
    );
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const applyPreset = (preset: RolePreset) => {
    setFormRoleKey(preset.id);
    setFormRoleTitle(preset.roleTitle);
    setFormModules([...preset.modules]);
    setFormAccessLevel(preset.accessLevel);
    if (preset.id === "smm") {
      setFormDepartment("Marketing & Ads");
    } else if (preset.id === "content") {
      setFormDepartment("Creative & Content");
    } else if (preset.id === "sales") {
      setFormDepartment("Business Development");
    }
  };

  const toggleModule = (key: string) => {
    if (formModules.includes(key)) {
      setFormModules(formModules.filter((m) => m !== key));
    } else {
      setFormModules([...formModules, key]);
    }
  };

  const selectAllModules = () => {
    setFormModules(MANAGER_MODULES.map((m) => m.key));
  };

  const clearAllModules = () => {
    setFormModules([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      if (formModules.length === 0) {
        throw new Error("Please select at least one module for this role.");
      }

      if (editingStaff) {
        await updateFn({
          data: {
            id: editingStaff.id,
            name: formName,
            email: formEmail,
            password: formPassword || undefined,
            roleTitle: formRoleTitle,
            roleKey: formRoleKey,
            department: formDepartment,
            accessLevel: formAccessLevel,
            modules: formModules,
            active: editingStaff.active,
          },
        });

        setSuccess(`Permissions updated successfully for ${formName}!`);
      } else {
        if (!formPassword || formPassword.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        await createFn({
          data: {
            name: formName,
            email: formEmail,
            password: formPassword,
            roleTitle: formRoleTitle,
            roleKey: formRoleKey,
            department: formDepartment,
            accessLevel: formAccessLevel,
            modules: formModules,
          },
        });

        setSuccess(`Manager account and role created for ${formName}! Auto-verified with instant access to /manager.`);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save manager role");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (staff: StaffRow) => {
    if (!confirm(`Are you sure you want to delete ${staff.name} (${staff.email})? Their login and manager permissions will be permanently removed.`)) {
      return;
    }

    try {
      setBusy(true);
      let deleted = false;
      try {
        await deleteFn({ data: { id: staff.id } });
        deleted = true;
      } catch {}

      if (!deleted) {
        await supabase.from("staff_members").delete().eq("id", staff.id);
      }
      setSuccess(`Manager ${staff.name} deleted.`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setBusy(false);
    }
  };

  const toggleActiveStatus = async (staff: StaffRow) => {
    try {
      const next = !staff.active;
      await supabase.from("staff_members").update({ active: next }).eq("id", staff.id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleResetPasswordQuick = async (staff: StaffRow) => {
    const pw = prompt(`Enter new password for ${staff.email} (min 8 chars):`);
    if (!pw) return;
    if (pw.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      await updateFn({
        data: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          password: pw,
          roleTitle: staff.job_title || staff.role,
          roleKey: staff.role,
          department: staff.department || "Operations",
          accessLevel: "view",
          modules: staff.modules || ["analytics"],
          active: staff.active,
        },
      });
      alert(`Password updated successfully for ${staff.email}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update password");
    }
  };

  const filteredRows = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.job_title && r.job_title.toLowerCase().includes(q)) ||
      r.role.toLowerCase().includes(q) ||
      (r.department && r.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-espresso/15 bg-sand/60 px-3 py-1 text-xs font-bold text-espresso">
            <ShieldCheck className="h-3.5 w-3.5 text-cocoa" />
            Role-Based Access Control (RBAC)
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-espresso sm:text-3xl">
            Manager Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-foreground/60 max-w-2xl">
            Create manager accounts, assign custom roles (e.g. SMM, Ad Manager, Content Lead), and grant exact module permissions. Managers will access <span className="font-mono text-xs font-bold text-espresso bg-espresso/5 px-1.5 py-0.5 rounded">/manager</span> and only see their permitted views.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/manager"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-espresso/20 bg-white px-4 py-2.5 text-xs font-bold text-espresso shadow-sm hover:bg-sand transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview /manager Portal
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cocoa transition"
          >
            <Plus className="h-4 w-4" />
            Create New Manager Role
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-espresso/60">Total Managers</p>
            <Users className="h-4 w-4 text-espresso/40" />
          </div>
          <p className="mt-2 text-2xl font-black text-espresso">{rows.length}</p>
          <p className="mt-1 text-[11px] text-foreground/50">Accounts with portal access</p>
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">SMM & Ad Runners</p>
            <Radar className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-900">
            {rows.filter((r) => r.role === "smm" || (r.job_title && r.job_title.toLowerCase().includes("smm"))).length}
          </p>
          <p className="mt-1 text-[11px] text-foreground/50">View-only analytics & ads access</p>
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Accounts</p>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {rows.filter((r) => r.active).length}
          </p>
          <p className="mt-1 text-[11px] text-foreground/50">Enabled logins</p>
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Available Modules</p>
            <Sliders className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-900">{MANAGER_MODULES.length}</p>
          <p className="mt-1 text-[11px] text-foreground/50">Configurable granular permissions</p>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso/40" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-espresso/15 bg-sand/30 pl-9 pr-4 py-2 text-xs outline-none focus:border-cocoa focus:bg-white transition"
            />
          </div>

          <div className="text-xs text-foreground/50">
            Showing {filteredRows.length} of {rows.length} accounts
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-cocoa" />
            <p className="mt-2 text-xs text-foreground/50">Loading managers & RBAC rules...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-espresso/15 p-12 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-espresso/30" />
            <p className="mt-2 font-display text-base font-bold text-espresso">No manager accounts found</p>
            <p className="mt-1 text-xs text-foreground/50">
              Create your first role (e.g. SMM for your ad runner) to grant access to /manager.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white hover:bg-cocoa"
            >
              <Plus className="h-3.5 w-3.5" /> Create SMM / Manager Account
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-espresso/10 bg-sand/40 text-[11px] font-bold uppercase tracking-wider text-espresso/70">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Role / Designation</th>
                  <th className="px-4 py-3">Assigned Modules (RBAC)</th>
                  <th className="px-4 py-3">Access Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/6">
                {filteredRows.map((staff) => {
                  const mods = Array.isArray(staff.modules) ? staff.modules : [];
                  const isSmm = staff.role === "smm" || (staff.job_title && staff.job_title.toLowerCase().includes("smm"));

                  return (
                    <tr key={staff.id} className="hover:bg-sand/20 transition">
                      {/* Manager Name & Email */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-espresso text-sm">{staff.name}</div>
                        <div className="text-[11px] text-foreground/60">{staff.email}</div>
                      </td>

                      {/* Role & Department */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getRoleBadgeClass(staff.job_title || staff.role)}`}>
                          {staff.job_title || staff.role}
                        </span>
                        <div className="mt-0.5 text-[10px] text-foreground/50">
                          {staff.department || "Operations"}
                        </div>
                      </td>

                      {/* Modules Pills */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {mods.length === 0 ? (
                            <span className="text-[10px] italic text-red-500">No modules assigned</span>
                          ) : (
                            mods.slice(0, 3).map((mKey) => {
                              const def = MANAGER_MODULES.find((m) => m.key === mKey);
                              const Icon = MODULE_ICONS[mKey] || ShieldCheck;
                              return (
                                <span
                                  key={mKey}
                                  className="inline-flex items-center gap-1 rounded-md bg-espresso/5 border border-espresso/10 px-1.5 py-0.5 text-[10px] font-medium text-espresso"
                                  title={def?.description || mKey}
                                >
                                  <Icon className="h-2.5 w-2.5 text-cocoa" />
                                  {def?.name.split(" ")[0] || mKey}
                                </span>
                              );
                            })
                          )}
                          {mods.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-sand px-1.5 py-0.5 text-[10px] font-bold text-espresso/70">
                              +{mods.length - 3} more
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-foreground/40 font-mono">
                          {mods.length} of {MANAGER_MODULES.length} accessible
                        </span>
                      </td>

                      {/* Access Mode */}
                      <td className="px-4 py-3">
                        {isSmm ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold text-sky-700">
                            <Eye className="h-3 w-3" /> View Only (Ads)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            <ShieldCheck className="h-3 w-3" /> Full Access
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActiveStatus(staff)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                            staff.active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {staff.active ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(staff)}
                            className="rounded-lg border border-espresso/15 bg-white p-1.5 text-espresso hover:bg-sand transition"
                            title="Edit Permissions & Role"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPasswordQuick(staff)}
                            className="rounded-lg border border-espresso/15 bg-white p-1.5 text-espresso hover:bg-sand transition"
                            title="Reset Password"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(staff)}
                            className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 transition"
                            title="Delete Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-espresso/15 bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-black text-espresso">
                  {editingStaff ? "Edit Manager Role & Permissions" : "Add New Manager Role (RBAC)"}
                </h2>
                <p className="text-xs text-foreground/60">
                  {editingStaff
                    ? `Update login credentials and module permissions for ${editingStaff.name}`
                    : "Create email, password, and pick the exact modules they can view at /manager"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-espresso/10 hover:bg-sand transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Auto-Verify Notice */}
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>Instant Auto-Verify:</strong> No confirmation email is required. The manager can immediately sign in at <span className="font-mono font-bold text-espresso bg-white px-1.5 py-0.5 rounded border border-emerald-200">/manager</span> using this email and password.
              </span>
            </div>

            {/* Role Preset Buttons */}
            <div className="mt-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60 flex items-center gap-1 mb-2">
                <Sparkles className="h-3 w-3 text-cocoa" /> Quick Role Presets (1-Click Setup)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROLE_PRESETS.map((preset) => {
                  const active = formRoleKey === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-espresso bg-espresso text-white shadow-sm"
                          : "border-espresso/10 bg-sand/40 hover:bg-sand text-espresso"
                      }`}
                    >
                      <span className="text-xs font-bold truncate w-full">{preset.name}</span>
                      <span
                        className={`text-[10px] mt-0.5 truncate w-full ${
                          active ? "text-white/70" : "text-foreground/50"
                        }`}
                      >
                        {preset.modules.length} modules
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Name & Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad (SMM Specialist)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2.5 text-xs outline-none focus:border-cocoa focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">
                    Login Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="smm@yourcompany.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2.5 text-xs outline-none focus:border-cocoa focus:bg-white"
                  />
                </div>
              </div>

              {/* Password & Designation */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60 flex items-center justify-between">
                    <span>Password</span>
                    {editingStaff && (
                      <span className="text-[9px] text-foreground/40 normal-case">(leave blank to keep unchanged)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    minLength={8}
                    placeholder={editingStaff ? "••••••••" : "Minimum 8 characters"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2.5 text-xs outline-none focus:border-cocoa focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">
                    Role Title / Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Social Media & Ads Specialist"
                    value={formRoleTitle}
                    onChange={(e) => setFormRoleTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2.5 text-xs outline-none focus:border-cocoa focus:bg-white"
                  />
                </div>
              </div>

              {/* Department & Access Mode */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Marketing, Sales, Operations..."
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2.5 text-xs outline-none focus:border-cocoa focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/60">
                    Access Permission Level
                  </label>
                  <div className="mt-1 flex rounded-xl border border-espresso/15 bg-sand/30 p-1">
                    <button
                      type="button"
                      onClick={() => setFormAccessLevel("view")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        formAccessLevel === "view"
                          ? "bg-espresso text-white shadow-sm"
                          : "text-espresso/70 hover:text-espresso"
                      }`}
                    >
                      👁️ View Only (SMM Safe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormAccessLevel("manage")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        formAccessLevel === "manage"
                          ? "bg-espresso text-white shadow-sm"
                          : "text-espresso/70 hover:text-espresso"
                      }`}
                    >
                      ✏️ Full Access
                    </button>
                  </div>
                </div>
              </div>

              {/* Module Permissions Checkbox Grid */}
              <div className="rounded-2xl border border-espresso/10 bg-sand/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-espresso">
                      RBAC Module Permissions ({formModules.length} selected)
                    </h3>
                    <p className="text-[11px] text-foreground/50">
                      Only checked modules will appear in this manager&apos;s /manager sidebar and workspace.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllModules}
                      className="text-[10px] font-bold text-cocoa hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-[10px] text-foreground/30">|</span>
                    <button
                      type="button"
                      onClick={clearAllModules}
                      className="text-[10px] font-bold text-foreground/50 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {MANAGER_MODULES.map((mod) => {
                    const isChecked = formModules.includes(mod.key);
                    const Icon = MODULE_ICONS[mod.key] || ShieldCheck;

                    return (
                      <div
                        key={mod.key}
                        onClick={() => toggleModule(mod.key)}
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer select-none transition ${
                          isChecked
                            ? "border-espresso/40 bg-white shadow-sm"
                            : "border-transparent bg-white/50 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded text-espresso accent-espresso cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 ${isChecked ? "text-cocoa" : "text-foreground/40"}`} />
                            <span className="text-xs font-bold text-espresso">{mod.name}</span>
                            {mod.badge && (
                              <span className="rounded-full bg-emerald-500 px-1 py-0.2 text-[8px] font-black uppercase text-white">
                                {mod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-foreground/50 line-clamp-1">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cocoa disabled:opacity-60 transition"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editingStaff ? "Save Role & Permissions" : "Create Manager Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
