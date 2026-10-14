import { LayoutDashboard, FolderKanban, ListChecks, Palette, MessagesSquare } from "lucide-react";
import type { DepartmentConfig } from "../types";
import type { StaffMember } from "@/lib/use-staff";
import { OverviewSection, ProjectsSection, TasksSection, ChatSection, RecordsSection } from "../shared/sections";

const Overview = ({ staff }: { staff: StaffMember }) => (
  <OverviewSection staff={staff} deptName="Design" counters={[{ table: "design_requests", label: "In revision", filter: ["status", "revision"] }, { table: "design_requests", label: "Client approved", filter: ["client_approved", "true"] }]} />
);
const Requests = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="design_requests" title="Creative requests" subtitle="Briefs, Figma links, deliverables, revisions and client approval." titleKey="title" cols={[
    { key: "title", label: "Title", required: true },
    { key: "kind", label: "Type", type: "select", options: ["logo", "branding", "social", "web_ui", "print", "other"] },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "figma_url", label: "Figma link", type: "url" },
    { key: "file_url", label: "Deliverable file (PNG/SVG/PSD/AI)", type: "url" },
    { key: "preview_url", label: "Preview image", type: "url" },
    { key: "brief", label: "Brief", type: "textarea" },
    { key: "revision_notes", label: "Revision / feedback", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["requested", "in_progress", "revision", "delivered", "approved"], inline: true },
  ]} />
);

export const graphicDesign: DepartmentConfig = {
  slug: "graphic-design", name: "Graphic Design", short: "GD", authPath: "/gd-auth",
  tagline: "Creative requests, revisions, brand assets and approvals.",
  roles: ["designer"],
  sections: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, Component: Overview },
    { key: "requests", label: "Creative requests", icon: Palette, Component: Requests },
    { key: "projects", label: "Projects", icon: FolderKanban, Component: ProjectsSection },
    { key: "tasks", label: "Tasks", icon: ListChecks, Component: TasksSection },
    { key: "chat", label: "Chat", icon: MessagesSquare, Component: ChatSection },
  ],
};
