export const STAFF_MODULES = [
  { key: "dashboard", label: "Overview", path: "/staff/dashboard" },
  { key: "tasks", label: "My Tasks", path: "/staff/tasks" },
  { key: "projects", label: "Projects", path: "/staff/projects" },
  { key: "messages", label: "Messages", path: "/staff/messages" },
  { key: "notifications", label: "Notifications", path: "/staff/notifications" },
  { key: "documents", label: "Resources", path: "/staff/documents" },
  { key: "profile", label: "My Profile", path: "/staff/profile" },
] as const;

export type StaffModuleKey = (typeof STAFF_MODULES)[number]["key"];

/** Default module access per team role. Admin can override per member. */
export const STAFF_ROLES: { key: string; label: string; modules: StaffModuleKey[] }[] = [
  { key: "developer", label: "Developer", modules: ["dashboard", "tasks", "projects", "messages", "notifications", "documents", "profile"] },
  { key: "designer", label: "Designer", modules: ["dashboard", "tasks", "projects", "messages", "notifications", "documents", "profile"] },
  { key: "smm", label: "Social Media Manager", modules: ["dashboard", "tasks", "messages", "notifications", "documents", "profile"] },
  { key: "seo", label: "SEO Specialist", modules: ["dashboard", "tasks", "projects", "messages", "notifications", "documents", "profile"] },
  { key: "content", label: "Content Writer", modules: ["dashboard", "tasks", "messages", "notifications", "documents", "profile"] },
  { key: "sales", label: "Sales / BD", modules: ["dashboard", "tasks", "messages", "notifications", "documents", "profile"] },
  { key: "support", label: "Support Agent", modules: ["dashboard", "tasks", "messages", "notifications", "profile"] },
  { key: "manager", label: "Project Manager", modules: ["dashboard", "tasks", "projects", "messages", "notifications", "documents", "profile"] },
];

export function roleLabel(role: string) {
  return STAFF_ROLES.find((r) => r.key === role)?.label ?? role;
}

export function defaultModules(role: string): StaffModuleKey[] {
  return STAFF_ROLES.find((r) => r.key === role)?.modules ?? ["dashboard", "tasks", "profile"];
}
