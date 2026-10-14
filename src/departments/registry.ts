import type { DepartmentConfig } from "./types";
import { webDevelopment } from "./web-development";
import { seo } from "./seo";
import { graphicDesign } from "./graphic-design";
import { socialMedia } from "./social-media";
import { projectManagement } from "./project-management";

export const DEPARTMENTS: DepartmentConfig[] = [webDevelopment, seo, graphicDesign, socialMedia, projectManagement];

export function getDepartment(slug: string) {
  return DEPARTMENTS.find((d) => d.slug === slug);
}
