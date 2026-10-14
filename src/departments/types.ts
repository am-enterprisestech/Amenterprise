import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { StaffMember } from "@/lib/use-staff";

export interface DeptSection {
  key: string;
  label: string;
  icon: LucideIcon;
  Component: ComponentType<{ staff: StaffMember }>;
}

export interface DepartmentConfig {
  /** URL + database slug, e.g. "web-development" */
  slug: string;
  name: string;
  /** Short badge label, e.g. "DEV" */
  short: string;
  /** Dedicated authentication entry point, e.g. "/dev-auth" */
  authPath: string;
  tagline: string;
  /** Legacy staff_members.role values that belong to this department. */
  roles: string[];
  sections: DeptSection[];
}
