import { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, ListChecks, Users, Bug, MessagesSquare, Loader2 } from "lucide-react";
import type { DepartmentConfig } from "../types";
import type { StaffMember } from "@/lib/use-staff";
import { supabase } from "@/integrations/supabase/client";
import { StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { OverviewSection, ProjectsSection, TasksSection, ChatSection, RecordsSection } from "../shared/sections";
import { useMyProjects, updateRow } from "../shared/data";

const Overview = ({ staff }: { staff: StaffMember }) => (
  <OverviewSection staff={staff} deptName="Project Management" counters={[{ table: "dev_bugs", label: "Open issues", filter: ["status", "open"] }, { table: "design_requests", label: "Pending approvals", filter: ["status", "delivered"] }]} />
);

/** PM can update status/progress of their projects (flows to client portal). */
function Progress({ staff }: { staff: StaffMember }) {
  const { projects, loading, reload } = useMyProjects(staff.id);
  return (
    <>
      <StaffHeading title="Project status & progress" subtitle="Updates are visible to the admin and the client." />
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : projects.length === 0 ? <StaffEmpty label="No projects assigned." /> : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div><p className="font-bold text-foreground">{p.title}</p><p className="text-xs text-muted-foreground">due {p.due_date ?? "—"}</p></div>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={100} defaultValue={p.progress} onBlur={async (e) => { try { await updateRow("projects", p.id, { progress: Math.max(0, Math.min(100, Number(e.target.value))) }); reload(); } catch (er) { alert((er as Error).message); } }} className="w-20 rounded-xl border border-border bg-background px-2 py-1.5 text-xs" />
                <span className="text-xs">%</span>
                <select defaultValue={p.status} onChange={async (e) => { try { await updateRow("projects", p.id, { status: e.target.value }); reload(); } catch (er) { alert((er as Error).message); } }} className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs font-semibold">
                  {["planning", "in_progress", "review", "on_hold", "completed"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Team({ staff }: { staff: StaffMember }) {
  const { projects, projectIds } = useMyProjects(staff.id);
  const [rows, setRows] = useState<{ project_id: string; role_on_project: string | null; department_slug: string | null; staff_members: { name: string; am_id: string | null } | null }[]>([]);
  useEffect(() => {
    if (!projectIds.length) return;
    supabase.from("project_assignments").select("project_id, role_on_project, department_slug, staff_members(name, am_id)").in("project_id", projectIds)
      .then(({ data }) => setRows((data as never) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIds.join(",")]);
  return (
    <>
      <StaffHeading title="Project teams" subtitle="Who is assigned to each of your projects." />
      {projects.length === 0 ? <StaffEmpty label="No projects assigned." /> : projects.map((p) => (
        <div key={p.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
          <p className="font-bold text-foreground">{p.title}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {rows.filter((r) => r.project_id === p.id).map((r, i) => (
              <li key={i} className="text-foreground/80">{r.staff_members?.name ?? "Member"} <span className="text-xs text-muted-foreground">· {r.department_slug ?? "—"} · {r.role_on_project ?? "member"} {r.staff_members?.am_id ? `· ${r.staff_members.am_id}` : ""}</span></li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

const Issues = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="dev_bugs" title="Issues" subtitle="Raise and track project issues." titleKey="title" cols={[
    { key: "title", label: "Title", required: true },
    { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"], inline: true },
    { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "fixed", "closed"], inline: true },
    { key: "description", label: "Details", type: "textarea" },
  ]} />
);

export const projectManagement: DepartmentConfig = {
  slug: "project-management", name: "Project Management", short: "PM", authPath: "/pm-auth",
  tagline: "All assigned projects, progress, teams, issues and communication.",
  roles: ["manager", "sales", "support"],
  sections: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, Component: Overview },
    { key: "progress", label: "Status & progress", icon: FolderKanban, Component: Progress },
    { key: "projects", label: "Project details", icon: FolderKanban, Component: ProjectsSection },
    { key: "team", label: "Teams & assignments", icon: Users, Component: Team },
    { key: "issues", label: "Issues", icon: Bug, Component: Issues },
    { key: "tasks", label: "My tasks", icon: ListChecks, Component: TasksSection },
    { key: "chat", label: "Group & client chat", icon: MessagesSquare, Component: ChatSection },
  ],
};
