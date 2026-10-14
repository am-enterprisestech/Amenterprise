import { LayoutDashboard, FolderKanban, ListChecks, Bug, Rocket, MessagesSquare } from "lucide-react";
import type { DepartmentConfig } from "../types";
import type { StaffMember } from "@/lib/use-staff";
import { OverviewSection, ProjectsSection, TasksSection, ChatSection, RecordsSection } from "../shared/sections";

const Overview = ({ staff }: { staff: StaffMember }) => (
  <OverviewSection staff={staff} deptName="Developer" counters={[{ table: "dev_bugs", label: "Open bugs", filter: ["status", "open"] }, { table: "dev_bugs", label: "Fixed bugs", filter: ["status", "fixed"] }]} />
);
const Bugs = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="dev_bugs" title="Bug tracker" subtitle="Report bugs and move them through to fixed." titleKey="title" cols={[
    { key: "title", label: "Title", required: true },
    { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"], inline: true },
    { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "fixed", "closed"], inline: true },
    { key: "description", label: "Steps / details", type: "textarea" },
  ]} />
);

export const webDevelopment: DepartmentConfig = {
  slug: "web-development", name: "Web Development", short: "DEV", authPath: "/dev-auth",
  tagline: "Projects, sprint tasks, bugs, deployments and team chat.",
  roles: ["developer"],
  sections: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, Component: Overview },
    { key: "projects", label: "Projects & deploy links", icon: FolderKanban, Component: ProjectsSection },
    { key: "tasks", label: "Sprint tasks", icon: ListChecks, Component: TasksSection },
    { key: "bugs", label: "Bugs", icon: Bug, Component: Bugs },
    { key: "deploy", label: "Deployment checklist", icon: Rocket, Component: ProjectsSection },
    { key: "chat", label: "Chat", icon: MessagesSquare, Component: ChatSection },
  ],
};
