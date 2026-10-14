export interface ManagerModuleDef {
  key: string;
  name: string;
  category: "Marketing & Growth" | "Sales & Leads" | "Content & Site";
  description: string;
  badge?: string;
  iconName: string;
}

export const MANAGER_MODULES: ManagerModuleDef[] = [
  {
    key: "analytics",
    name: "Live Analytics & Traffic",
    category: "Marketing & Growth",
    description: "Real-time visitors, ad campaign referrers, page views, and traffic sources",
    badge: "live",
    iconName: "Radar",
  },
  {
    key: "bookings",
    name: "Consultation Bookings",
    category: "Sales & Leads",
    description: "Meeting schedules, client bookings, requested services and preferred slots",
    iconName: "CalendarCheck",
  },
  {
    key: "messages",
    name: "Contact Form Inquiries",
    category: "Sales & Leads",
    description: "Website contact form submissions, customer inquiries, and query details",
    iconName: "MessageSquare",
  },
  {
    key: "quotes",
    name: "Quote Requests",
    category: "Sales & Leads",
    description: "Incoming project quote requests, budgets, and scope requirements",
    iconName: "FileSignature",
  },
  {
    key: "pixels",
    name: "Tracking Pixels & Ads",
    category: "Marketing & Growth",
    description: "Meta Pixel, Google Ads / Tag Manager, and TikTok pixel tracking setup",
    iconName: "Target",
  },
  {
    key: "crm",
    name: "CRM Leads & Pipeline",
    category: "Sales & Leads",
    description: "Client pipeline stages, deal values, and customer contact records",
    iconName: "GitBranch",
  },
  {
    key: "newsletter",
    name: "Newsletter Subscribers",
    category: "Marketing & Growth",
    description: "Subscribed audience emails and newsletter list growth",
    iconName: "Mail",
  },
  {
    key: "blog",
    name: "Blog Posts & Articles",
    category: "Content & Site",
    description: "Articles, published insights, read counts and blog management",
    iconName: "BookOpen",
  },
  {
    key: "portfolio",
    name: "Portfolio & Case Studies",
    category: "Content & Site",
    description: "Showcase client projects, case studies, and live deliverables",
    iconName: "Briefcase",
  },
  {
    key: "services",
    name: "Agency Services",
    category: "Content & Site",
    description: "Catalog of active services, packages, and technical offerings",
    iconName: "Wrench",
  },
  {
    key: "testimonials",
    name: "Client Testimonials",
    category: "Content & Site",
    description: "Client reviews, ratings, and social proof quotes",
    iconName: "Star",
  },
  {
    key: "faqs",
    name: "FAQs & Knowledge",
    category: "Content & Site",
    description: "Frequently asked questions and answers for website visitors",
    iconName: "HelpCircle",
  },
];

export interface RolePreset {
  id: string;
  name: string;
  roleTitle: string;
  description: string;
  modules: string[];
  accessLevel: "view" | "manage";
  color: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "smm",
    name: "SMM / Social Media & Ads",
    roleTitle: "Social Media & Ads Specialist",
    description: "Perfect for media buyers and ad managers. View access to live analytics, bookings, contact form submissions, quotes, and tracking pixels.",
    modules: ["analytics", "bookings", "messages", "quotes", "pixels"],
    accessLevel: "view",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    id: "content",
    name: "Content & Marketing Lead",
    roleTitle: "Content & Marketing Manager",
    description: "Manages or views blog posts, portfolio projects, newsletter subscribers, and testimonials.",
    modules: ["blog", "portfolio", "testimonials", "newsletter", "analytics"],
    accessLevel: "manage",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  {
    id: "sales",
    name: "Sales & Client Representative",
    roleTitle: "Sales & Account Executive",
    description: "Handles bookings, incoming contact form queries, quote requests, and CRM deals.",
    modules: ["bookings", "messages", "quotes", "crm", "analytics"],
    accessLevel: "manage",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  {
    id: "custom",
    name: "Custom Role",
    roleTitle: "Portal Manager",
    description: "Select custom permissions tailored to your exact needs.",
    modules: ["analytics", "bookings", "messages"],
    accessLevel: "view",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
];

export function getModuleByKey(key: string): ManagerModuleDef | undefined {
  return MANAGER_MODULES.find((m) => m.key === key);
}

export function getRoleBadgeClass(roleTitle: string): string {
  const t = roleTitle.toLowerCase();
  if (t.includes("smm") || t.includes("social") || t.includes("ad")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  if (t.includes("content") || t.includes("write") || t.includes("blog")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (t.includes("sales") || t.includes("lead") || t.includes("crm")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-indigo-50 text-indigo-700 border-indigo-200";
}
