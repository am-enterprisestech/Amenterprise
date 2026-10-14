import { LayoutDashboard, FolderKanban, ListChecks, KeyRound, MessagesSquare } from "lucide-react";
import type { DepartmentConfig } from "../types";
import type { StaffMember } from "@/lib/use-staff";
import { OverviewSection, ProjectsSection, TasksSection, ChatSection, RecordsSection } from "../shared/sections";

const Overview = ({ staff }: { staff: StaffMember }) => (
  <OverviewSection staff={staff} deptName="SEO" counters={[{ table: "seo_keywords", label: "Tracked keywords" }, { table: "seo_keywords", label: "Ranking keywords", filter: ["status", "ranking"] }]} />
);
const Keywords = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="seo_keywords" title="Keywords & rankings" subtitle="Update current rank inline — previous rank is kept for history." titleKey="keyword" cols={[
    { key: "keyword", label: "Keyword", required: true },
    { key: "target_url", label: "Target URL", type: "url" },
    { key: "search_volume", label: "Volume", type: "number" },
    { key: "difficulty", label: "Difficulty", type: "number" },
    { key: "previous_rank", label: "Previous rank", type: "number" },
    { key: "current_rank", label: "Rank", type: "number", inline: true },
    { key: "status", label: "Status", type: "select", options: ["tracking", "ranking", "lost"], inline: true },
  ]} />
);

export const seo: DepartmentConfig = {
  slug: "seo", name: "SEO", short: "SEO", authPath: "/seo-auth",
  tagline: "Client projects, keywords, rankings, on-page and technical tasks.",
  roles: ["seo", "content"],
  sections: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, Component: Overview },
    { key: "projects", label: "Clients & projects", icon: FolderKanban, Component: ProjectsSection },
    { key: "keywords", label: "Keywords", icon: KeyRound, Component: Keywords },
    { key: "tasks", label: "On-page & technical tasks", icon: ListChecks, Component: TasksSection },
    { key: "chat", label: "Chat", icon: MessagesSquare, Component: ChatSection },
  ],
};
