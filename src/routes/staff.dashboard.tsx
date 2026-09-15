import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { generateAMID } from "@/lib/am-id";
import { PMDashboard } from "@/components/portal/department/PMDashboard";
import { DeveloperPortal } from "@/components/portal/department/DeveloperPortal";
import { DesignerPortal } from "@/components/portal/department/DesignerPortal";
import { SEOPortal } from "@/components/portal/department/SEOPortal";
import { SMMPortal } from "@/components/portal/department/SMMPortal";
import { GraphicDesignerPortal } from "@/components/portal/department/GraphicDesignerPortal";
import { WhatsAppChat } from "@/components/chat/WhatsAppChat";
import { PortalRoleSwitcher } from "@/components/portal/PortalRoleSwitcher";

export const Route = createFileRoute("/staff/dashboard")({
  head: () => ({
    meta: [
      { title: "Team Overview — AM Enterprise Department Portals" },
      { name: "description", content: "Department-specific engineering, design, SEO, marketing, and PM portals." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <StaffShell module="dashboard">
      {(staff) => (
        <>
          <DepartmentRouter staff={staff} />
          <PortalRoleSwitcher activeRoleKey="manager" />
        </>
      )}
    </StaffShell>
  ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DepartmentRouter({ staff }: { staff: any }) {
  const { rows: tasks, reload: reloadTasks } = useStaffRows("staff_tasks", staff.id, { orderBy: "created_at" });
  const { rows: projects, reload: reloadProjects } = useStaffRows("projects", staff.id, { orderBy: "created_at" });
  const { rows: clients } = useStaffRows("portal_clients", staff.id, { orderBy: "created_at" });

  const defaultRole = String(staff.role || staff.job_title || staff.department || "manager").toLowerCase();
  const [activeDepartment, setActiveDepartment] = useState<string>(() => {
    if (defaultRole.includes("dev") || defaultRole.includes("developer")) return "developer";
    if (defaultRole.includes("ui") || defaultRole.includes("designer") && !defaultRole.includes("graphic")) return "designer";
    if (defaultRole.includes("seo")) return "seo";
    if (defaultRole.includes("smm") || defaultRole.includes("social")) return "smm";
    if (defaultRole.includes("graphic")) return "graphic-designer";
    return "manager";
  });

  const amId = staff.am_id || generateAMID("staff", staff.id);

  const currentUser = {
    id: staff.id,
    am_id: amId,
    name: staff.name,
    role: activeDepartment.toUpperCase(),
    type: "staff" as const,
  };

  const handleRefresh = () => {
    reloadTasks();
    reloadProjects();
  };

  const renderActivePortal = () => {
    switch (activeDepartment) {
      case "developer":
        return (
          <div className="space-y-8">
            <DeveloperPortal staff={staff} tasks={tasks} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">Engineering & Code Group Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
      case "designer":
        return (
          <div className="space-y-8">
            <DesignerPortal staff={staff} tasks={tasks} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">UI/UX Design Studio Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
      case "seo":
        return (
          <div className="space-y-8">
            <SEOPortal staff={staff} tasks={tasks} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">SEO & Keywords Strategy Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
      case "smm":
        return (
          <div className="space-y-8">
            <SMMPortal staff={staff} tasks={tasks} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">Social Media & Growth Marketing Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
      case "graphic-designer":
        return (
          <div className="space-y-8">
            <GraphicDesignerPortal staff={staff} tasks={tasks} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">Creative Graphic Studio Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
      case "manager":
      default:
        return (
          <div className="space-y-8">
            <PMDashboard staff={staff} projects={projects} tasks={tasks} clients={clients} onRefresh={handleRefresh} />
            <div className="pt-6 border-t border-espresso/10">
              <h2 className="mb-4 font-display text-lg font-black text-espresso">Live Project Group & Team Chat</h2>
              <WhatsAppChat currentUser={currentUser} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Selector Bar */}
      <div className="rounded-2xl border border-espresso/10 bg-sand/40 p-2 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1">
          <p className="text-xs font-bold uppercase tracking-wider text-espresso/70">
            Department Portals:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "manager", label: "Project Manager" },
              { id: "developer", label: "Developer" },
              { id: "designer", label: "UI/UX Designer" },
              { id: "seo", label: "SEO Specialist" },
              { id: "smm", label: "Social Media" },
              { id: "graphic-designer", label: "Graphic Designer" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDepartment(d.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeDepartment === d.id
                    ? "bg-espresso text-white shadow-sm"
                    : "border border-espresso/10 bg-white text-espresso hover:bg-sand"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Active Department Workspace */}
      {renderActivePortal()}
    </div>
  );
}

