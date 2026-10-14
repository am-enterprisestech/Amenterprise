import { LayoutDashboard, Megaphone, CalendarDays, ListChecks, MessagesSquare } from "lucide-react";
import type { DepartmentConfig } from "../types";
import type { StaffMember } from "@/lib/use-staff";
import { OverviewSection, TasksSection, ChatSection, RecordsSection } from "../shared/sections";

const PLATFORMS = ["facebook", "instagram", "linkedin", "tiktok", "x", "youtube", "pinterest"];

const Overview = ({ staff }: { staff: StaffMember }) => (
  <OverviewSection staff={staff} deptName="Social Media" counters={[{ table: "smm_campaigns", label: "Active campaigns", filter: ["status", "active"] }, { table: "smm_posts", label: "Posts awaiting approval", filter: ["approval_status", "pending"] }]} />
);
const Campaigns = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="smm_campaigns" title="Campaigns" titleKey="name" cols={[
    { key: "name", label: "Name", required: true },
    { key: "platform", label: "Platform", type: "select", options: PLATFORMS },
    { key: "budget_usd", label: "Budget (USD)", type: "number" },
    { key: "start_date", label: "Start", type: "date" },
    { key: "end_date", label: "End", type: "date" },
    { key: "notes", label: "Notes / performance", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["planned", "active", "paused", "completed"], inline: true },
  ]} />
);
const Posts = ({ staff }: { staff: StaffMember }) => (
  <RecordsSection staff={staff} table="smm_posts" withStaff={false} title="Content calendar" subtitle="Schedule posts, captions and assets; clients approve them." titleKey="caption" cols={[
    { key: "caption", label: "Caption", type: "textarea", required: true },
    { key: "platform", label: "Platform", type: "select", options: PLATFORMS },
    { key: "scheduled_at", label: "Scheduled", type: "datetime" },
    { key: "media_url", label: "Asset URL", type: "url" },
    { key: "status", label: "Status", type: "select", options: ["draft", "scheduled", "published"], inline: true },
    { key: "approval_status", label: "Approval", type: "select", options: ["pending", "approved", "changes_requested"], inline: true },
  ]} />
);

export const socialMedia: DepartmentConfig = {
  slug: "social-media", name: "Social Media Management", short: "SMM", authPath: "/smm-auth",
  tagline: "Campaigns, content calendar, captions and approvals.",
  roles: ["smm"],
  sections: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, Component: Overview },
    { key: "campaigns", label: "Campaigns", icon: Megaphone, Component: Campaigns },
    { key: "calendar", label: "Content calendar", icon: CalendarDays, Component: Posts },
    { key: "tasks", label: "Tasks", icon: ListChecks, Component: TasksSection },
    { key: "chat", label: "Chat", icon: MessagesSquare, Component: ChatSection },
  ],
};
