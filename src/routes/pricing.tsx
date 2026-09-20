import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { useState, useMemo } from "react";
import {
  Check,
  Globe,
  Smartphone,
  Building2,
  Bot,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";
import { trackCTAClick } from "@/lib/meta-analytics";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Engagement Models — AM Enterprises" },
      {
        name: "description",
        content:
          "Transparent pricing plans and custom engagement models for Web Ecosystems, Mobile Apps, ERP & CRM Systems, AI Automation, and Growth Campaigns.",
      },
      { property: "og:title", content: "Pricing & Engagement Models — AM Enterprises" },
      {
        property: "og:description",
        content:
          "Browse categorized pricing packages with clear deliverables, senior engineering talent, and zero hidden costs.",
      },
      { property: "og:url", content: SITE_URL + "/pricing" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/pricing" }],
  }),
  component: PricingPage,
});

// Category Definition Interface
interface CategoryDef {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  icon: React.ElementType;
  heading: string;
  caption: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "web",
    name: "Web & Ecosystems",
    shortName: "Web & Apps",
    badge: "Digital Platforms",
    icon: Globe,
    heading: "Websites, Web Apps & SaaS Ecosystems",
    caption:
      "High-conversion corporate platforms, web applications, and custom SaaS products engineered with React, Vite, and high-velocity server APIs. Tailored for companies aiming to establish dominant digital authority and seamless user journeys.",
  },
  {
    id: "mobile",
    name: "Mobile Applications",
    shortName: "Mobile Apps",
    badge: "iOS & Android",
    icon: Smartphone,
    heading: "Native & Cross-Platform Mobile Apps",
    caption:
      "Fluid, intuitive iOS and Android applications built with React Native and Flutter. Features offline-first data sync, biometrics, real-time push notifications, and seamless cloud integrations tailored for enterprise scale.",
  },
  {
    id: "erp",
    name: "ERP & CRM Systems",
    shortName: "ERP & CRM",
    badge: "Enterprise Operations",
    icon: Building2,
    heading: "Custom Business ERP & Lead CRM Platforms",
    caption:
      "Centralized operational hubs that consolidate inventory, finance, project management, and sales pipelines into one intuitive dashboard. Eliminate operational silos and empower leadership with real-time analytics.",
  },
  {
    id: "ai",
    name: "AI & Automation",
    shortName: "AI & Automation",
    badge: "Intelligent Systems",
    icon: Bot,
    heading: "Custom AI Agents & Workflow Automation",
    caption:
      "Autonomous AI assistants, automated lead qualification, and end-to-end integration workflows. Replace repetitive manual processes with intelligent server-side automations that operate 24/7 with zero error margins.",
  },
  {
    id: "marketing",
    name: "Growth & Meta Ads",
    shortName: "Growth & Ads",
    badge: "Revenue Attribution",
    icon: TrendingUp,
    heading: "Full-Funnel Performance Marketing & CAPI Tracking",
    caption:
      "Data-driven ad campaigns on Meta (Facebook/Instagram), Google, and TikTok backed by server-side Conversions API (CAPI) and first-party attribution engines. Engineered to lower customer acquisition costs and scale revenue.",
  },
];

export type PlanCategory = "web" | "mobile" | "erp" | "ai" | "marketing";

export interface PlanItem {
  id: string;
  category: PlanCategory;
  name: string;
  tagline: string;
  priceOneTime?: string;
  priceMonthly?: string;
  priceAnnual?: string;
  pricePeriod?: string;
  featured?: boolean;
  popularBadge?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaUrl: string;
}

// Default Fallback Plans (5 Categories x 3 Plans = 15 Comprehensive Packages)
const CURATED_PLANS: PlanItem[] = [
  // WEB & ECOSYSTEMS
  {
    id: "web-starter",
    category: "web",
    name: "Starter Web",
    tagline: "Essential digital presence for growing businesses",
    priceOneTime: "$999",
    priceMonthly: "$149",
    priceAnnual: "$119",
    pricePeriod: "one-time",
    description: "Modern, high-performance brand platform built to convert visitors into qualified leads.",
    features: [
      "Custom 5-Page Responsive Site",
      "High-Speed Vite & React Architecture",
      "SEO Tags & Meta Indexing",
      "Contact Form & Meta Pixel Setup",
      "Fast Global CDN Hosting Setup",
      "14-Day Rapid Delivery",
    ],
    ctaLabel: "Get Started",
    ctaUrl: "/contact",
  },
  {
    id: "web-growth",
    category: "web",
    name: "Growth Web Ecosystem",
    tagline: "High-impact web app with dynamic database flows",
    priceOneTime: "$2,499",
    priceMonthly: "$299",
    priceAnnual: "$239",
    pricePeriod: "one-time",
    featured: true,
    popularBadge: "Most Popular",
    description: "Complete web app platform with Supabase backend, CMS, user auth, and lead tracking.",
    features: [
      "Up to 15 Dynamic Pages / Web App",
      "Supabase Database & Content CMS",
      "Role-Based User Authentication",
      "Full Meta Ads Tracking & CAPI Setup",
      "Interactive Calculators & Lead Forms",
      "Custom UI Micro-Animations",
      "30-Day Post-Launch SLA Support",
    ],
    ctaLabel: "Start Project",
    ctaUrl: "/contact",
  },
  {
    id: "web-enterprise",
    category: "web",
    name: "Enterprise Custom Platform",
    tagline: "Bespoke SaaS platform with custom microservices",
    priceOneTime: "$4,999+",
    priceMonthly: "$599",
    priceAnnual: "$479",
    pricePeriod: "custom",
    popularBadge: "Enterprise Choice",
    description: "Fully custom web product built for high-traffic workloads and enterprise data security.",
    features: [
      "Unlimited Scale & Modular Architecture",
      "Custom REST / GraphQL APIs & Backend",
      "Real-Time Executive Analytics Dashboard",
      "Multi-Tenant Portal & Advanced Auth",
      "SOC2 / GDPR Compliance Readiness",
      "Dedicated Senior Engineering Team",
    ],
    ctaLabel: "Request Proposal",
    ctaUrl: "/book",
  },

  // MOBILE APPLICATIONS
  {
    id: "mobile-mvp",
    category: "mobile",
    name: "Mobile MVP",
    tagline: "Fast-to-market iOS & Android launch package",
    priceOneTime: "$2,999",
    priceMonthly: "$349",
    priceAnnual: "$279",
    pricePeriod: "one-time",
    description: "Core cross-platform app to validate product-market fit with real smartphone users.",
    features: [
      "iOS & Android Cross-Platform App",
      "Sleek UI/UX Design System",
      "Supabase / Firebase Backend",
      "Push Notifications & User Auth",
      "App Store & Play Store Submissions",
      "30-Day Technical Warranty",
    ],
    ctaLabel: "Launch MVP",
    ctaUrl: "/contact",
  },
  {
    id: "mobile-pro",
    category: "mobile",
    name: "Pro Mobile Product",
    tagline: "Feature-rich mobile experience with in-app payments",
    priceOneTime: "$5,999",
    priceMonthly: "$599",
    priceAnnual: "$479",
    pricePeriod: "one-time",
    featured: true,
    popularBadge: "Best Value",
    description: "High-volume consumer or internal staff application with offline sync and payment engine.",
    features: [
      "Native iOS & Android Performance",
      "Stripe / Payment Gateway Integration",
      "Real-Time Chat or Data Feed",
      "Offline-First Data Storage",
      "Custom API Integration & Webhooks",
      "Automated End-to-End Testing",
      "60-Day Post-Launch Support",
    ],
    ctaLabel: "Build Mobile App",
    ctaUrl: "/contact",
  },
  {
    id: "mobile-enterprise",
    category: "mobile",
    name: "Enterprise Mobile Suite",
    tagline: "Mission-critical mobile software for enterprise teams",
    priceOneTime: "$9,999+",
    priceMonthly: "$999",
    priceAnnual: "$799",
    pricePeriod: "custom",
    popularBadge: "Custom Suite",
    description: "Heavyweight mobile product infrastructure with biometric security and hardware integration.",
    features: [
      "Biometric & Hardware Security",
      "Custom Bluetooth / IoT Integration",
      "Multi-Region Data Replication",
      "Dedicated Mobile DevOps Pipeline",
      "Executive Analytics & Monitoring",
      "24/7 SLA Guarantee",
    ],
    ctaLabel: "Consult Engineer",
    ctaUrl: "/book",
  },

  // ERP & CRM SYSTEMS
  {
    id: "erp-crm-starter",
    category: "erp",
    name: "CRM Pipeline Starter",
    tagline: "Unified sales pipeline for medium-sized teams",
    priceOneTime: "$1,499",
    priceMonthly: "$199",
    priceAnnual: "$159",
    pricePeriod: "one-time",
    description: "Consolidate inquiries from Meta Ads, forms, and WhatsApp into one organized CRM pipeline.",
    features: [
      "Visual Drag-and-Drop Deal Board",
      "Automatic Lead Sync from Forms & Ads",
      "Lead Source & Attribution Tracking",
      "Team Task & Follow-Up Reminders",
      "Email & WhatsApp Quick Actions",
      "10 Team Member Accounts",
    ],
    ctaLabel: "Deploy CRM",
    ctaUrl: "/contact",
  },
  {
    id: "erp-complete",
    category: "erp",
    name: "Complete Business ERP",
    tagline: "All-in-one platform for inventory, projects & finance",
    priceOneTime: "$3,999",
    priceMonthly: "$499",
    priceAnnual: "$399",
    pricePeriod: "one-time",
    featured: true,
    popularBadge: "Operations Standard",
    description: "Total operational control. Manage inventory, invoicing, team allocation, and client portals.",
    features: [
      "Inventory & Supply Chain Tracking",
      "Invoicing, Quotes & Expense Reports",
      "Project Milestones & Task Tracking",
      "Client Self-Service Portal",
      "Custom Role-Based Permissions (RBAC)",
      "Financial Analytics & PDF Export",
      "Full Team Onboarding & Training",
    ],
    ctaLabel: "Request ERP Demo",
    ctaUrl: "/book",
  },
  {
    id: "erp-custom",
    category: "erp",
    name: "Custom Enterprise ERP",
    tagline: "Bespoke operational core for multi-branch companies",
    priceOneTime: "$7,999+",
    priceMonthly: "$899",
    priceAnnual: "$719",
    pricePeriod: "custom",
    popularBadge: "Custom Built",
    description: "Tailor-made enterprise software replacing fragmented spreadsheets and legacy software.",
    features: [
      "Bespoke ERP Architecture & Data Schema",
      "Legacy Data Migration & Cleansing",
      "Multi-Branch & Multi-Currency Support",
      "On-Premise or Hybrid Cloud Setup",
      "Custom SAP / Oracle / QuickBooks Sync",
      "Dedicated Enterprise SLA Support",
    ],
    ctaLabel: "Schedule Audit",
    ctaUrl: "/book",
  },

  // AI & AUTOMATION
  {
    id: "ai-workflow",
    category: "ai",
    name: "Workflow Automation",
    tagline: "Automate manual tasks across your software stack",
    priceOneTime: "$1,299",
    priceMonthly: "$149",
    priceAnnual: "$119",
    pricePeriod: "one-time",
    description: "Connect your CRM, email, accounting, and messaging apps to execute zero-delay workflows.",
    features: [
      "Up to 5 Complex Multi-Step Workflows",
      "Zapier / Make / Custom Webhook Connectors",
      "Instant Email & SMS Notification Triggers",
      "Automated PDF & Document Generation",
      "Error Handling & Retries Engine",
      "Comprehensive Workflow Docs",
    ],
    ctaLabel: "Automate Workflows",
    ctaUrl: "/contact",
  },
  {
    id: "ai-sales-agent",
    category: "ai",
    name: "AI Sales & Support Agent",
    tagline: "24/7 AI chatbot trained on your company knowledge",
    priceOneTime: "$2,799",
    priceMonthly: "$299",
    priceAnnual: "$239",
    pricePeriod: "one-time",
    featured: true,
    popularBadge: "Highest ROI",
    description: "Intelligent AI assistant that engages website visitors, qualifies leads, and books meetings.",
    features: [
      "Custom AI Model Trained on Your Docs",
      "Website & WhatsApp Multi-Channel Agent",
      "Automated Lead Qualification & Booking",
      "Live Knowledge Ingestion & Updates",
      "Human Escalation & Live Chat Handoff",
      "Full Chat Transcripts & Analytics",
      "Meta Ads & CRM Attribution Integration",
    ],
    ctaLabel: "Build AI Agent",
    ctaUrl: "/contact",
  },
  {
    id: "ai-enterprise-engine",
    category: "ai",
    name: "Enterprise AI Engine",
    tagline: "Custom LLM & document intelligence pipeline",
    priceOneTime: "$6,499+",
    priceMonthly: "$799",
    priceAnnual: "$639",
    pricePeriod: "custom",
    popularBadge: "Custom LLM",
    description: "Private AI models processing high-volume documents, contracts, and internal databases.",
    features: [
      "Private RAG / Vector Database Engine",
      "Automated OCR & Document Processing",
      "Predictive Analytics & Forecasting Models",
      "Enterprise Data Isolation & Encryption",
      "Custom Fine-Tuned AI Models",
      "Ongoing AI Model Maintenance",
    ],
    ctaLabel: "Consult AI Lead",
    ctaUrl: "/book",
  },

  // GROWTH & META ADS
  {
    id: "marketing-starter",
    category: "marketing",
    name: "Ad Campaign Launch",
    tagline: "Targeted Meta & Google paid acquisition setup",
    priceOneTime: "$799",
    priceMonthly: "$799",
    priceAnnual: "$639",
    pricePeriod: "per month",
    description: "High-ROI campaign creation and weekly optimization for rapid lead generation.",
    features: [
      "Meta (Facebook & IG) + Google Ad Management",
      "Audience Targeting & Competitor Research",
      "High-Converting Ad Copywriting",
      "Meta Pixel & CAPI Deduplication Setup",
      "Weekly A/B Performance Reports",
      "Up to $5k Monthly Ad Spend Managed",
    ],
    ctaLabel: "Launch Campaigns",
    ctaUrl: "/contact",
  },
  {
    id: "marketing-growth",
    category: "marketing",
    name: "Full-Funnel Growth Retainer",
    tagline: "Complete lead engine with landing page optimization",
    priceOneTime: "$1,899",
    priceMonthly: "$1,899",
    priceAnnual: "$1,519",
    pricePeriod: "per month",
    featured: true,
    popularBadge: "Growth Engine",
    description: "Aggressive multi-channel acquisition, dedicated landing page funnels, and CAPI attribution.",
    features: [
      "Omni-Channel Ads (Meta, Google, TikTok)",
      "Dedicated High-Converting Landing Page",
      "Meta Conversions API (CAPI) Tracking",
      "First-Party UTM & Click Attribution",
      "Lead Nurturing & Email Follow-Ups",
      "Up to $25k Monthly Ad Spend Managed",
      "Bi-Weekly Growth Strategy Sessions",
    ],
    ctaLabel: "Scale Growth",
    ctaUrl: "/contact",
  },
  {
    id: "marketing-enterprise",
    category: "marketing",
    name: "Enterprise Growth Partner",
    tagline: "Dedicated performance marketing & creative lab",
    priceOneTime: "$3,999+",
    priceMonthly: "$3,999",
    priceAnnual: "$3,199",
    pricePeriod: "per month",
    popularBadge: "Enterprise Growth",
    description: "Dominate your market segment with unlimited creative production and advanced BI analytics.",
    features: [
      "Unlimited Ad Campaign Management",
      "Dedicated Ad Strategist & Copywriter",
      "Custom Video & Graphic Ad Creative Lab",
      "Multi-Touch Attribution Dashboard",
      "Custom CRM Lead Scoring Integration",
      "Unlimited Managed Ad Spend",
      "Weekly Executive Growth Briefings",
    ],
    ctaLabel: "Book Growth Call",
    ctaUrl: "/book",
  },
];

type PlanRow = {
  id: string;
  name: string;
  price: string;
  price_period: string | null;
  description: string | null;
  features: string[] | null;
  cta_label: string | null;
  cta_url: string | null;
  featured: boolean;
  category?: string | null;
};

function PricingPage() {
  useApplyPageSeo("/pricing");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const { rows: dbPlans, loading } = useLiveList<PlanRow>("pricing_plans", {
    orderBy: { column: "sort_order" },
  });

  // Combine DB plans with Curated default plans if available
  const allPlans = useMemo(() => {
    if (!dbPlans || dbPlans.length === 0) {
      return CURATED_PLANS;
    }
    // Map DB plans into structured items
    const mappedDb: PlanItem[] = dbPlans.map((p, idx) => ({
      id: p.id,
      category: (p.category as PlanCategory) || (idx < 3 ? "web" : idx < 6 ? "mobile" : idx < 9 ? "erp" : idx < 12 ? "ai" : "marketing"),
      name: p.name,
      tagline: p.description?.slice(0, 50) || "Professional package",
      priceOneTime: p.price,
      priceMonthly: p.price,
      priceAnnual: p.price.includes("$") ? `$${Math.round(parseInt(p.price.replace(/[^0-9]/g, "") || "1000") * 0.8)}` : p.price,
      pricePeriod: p.price_period || "package",
      featured: p.featured,
      popularBadge: p.featured ? "Popular" : undefined,
      description: p.description || "",
      features: p.features || [],
      ctaLabel: p.cta_label || "Get started",
      ctaUrl: p.cta_url || "/contact",
    }));

    // If DB has fewer than 10 plans, merge curated plans to ensure all categories have content
    const existingCategories = new Set(mappedDb.map((m) => m.category));
    const missingCurated = CURATED_PLANS.filter((c) => !existingCategories.has(c.category));

    return [...mappedDb, ...missingCurated];
  }, [dbPlans]);

  // Count of plans per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPlans.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = allPlans.filter((p) => p.category === cat.id).length;
    });
    return counts;
  }, [allPlans]);

  // Categories to display based on selected filter
  const displayedCategories = useMemo(() => {
    if (selectedCategory === "all") {
      return CATEGORIES;
    }
    return CATEGORIES.filter((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <PageHeader
        eyebrow="Pricing & Packages"
        title="Transparent investments. Engineered for ROI."
        description="Choose a structured package or custom engagement model designed for high-growth tech ecosystems. Every package includes senior engineer execution, Meta attribution, and dedicated SLA guarantees."
      />

      {/* =========================================================
          CONTROLS: FILTER BAR + BILLING TOGGLE
      ========================================================= */}
      <section className="sticky top-20 z-40 border-y border-espresso/10 bg-white/90 backdrop-blur-xl shadow-soft">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-3 sm:px-6 md:flex-row lg:px-10">
          
          {/* CATEGORY FILTER TABS (Mobile horizontal swipe row) */}
          <div className="w-full overflow-x-auto no-scrollbar md:w-auto">
            <div className="flex flex-nowrap items-center gap-1.5 min-w-max pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedCategory === "all"
                    ? "bg-espresso text-white shadow-soft"
                    : "bg-sand/60 text-espresso/70 hover:bg-sand hover:text-espresso"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cocoa" />
                <span>All Packages</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "bg-espresso/10 text-espresso"
                  }`}
                >
                  {categoryCounts.all}
                </span>
              </button>

              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-espresso text-white shadow-soft"
                        : "bg-sand/60 text-espresso/70 hover:bg-sand hover:text-espresso"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-copper" : "text-cocoa"}`} />
                    <span>{cat.shortName}</span>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                        active ? "bg-white/20 text-white" : "bg-espresso/10 text-espresso"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BILLING TOGGLE */}
          <div className="flex items-center gap-3 shrink-0 rounded-2xl border border-espresso/10 bg-sand/40 p-1">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                billingCycle === "monthly" ? "bg-white text-espresso shadow-sm" : "text-espresso/60 hover:text-espresso"
              }`}
            >
              Standard Rate
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                billingCycle === "annual" ? "bg-cocoa text-white shadow-sm" : "text-espresso/60 hover:text-espresso"
              }`}
            >
              <span>Annual Retainer</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white">
                Save 20%
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================
          CATEGORIZED SECTIONS & PLAN CARDS
      ========================================================= */}
      <section className="bg-sand/20 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          
          {loading && dbPlans.length === 0 ? (
            <div className="grid place-items-center py-24 text-sm font-semibold text-espresso/50">
              Loading pricing packages…
            </div>
          ) : (
            <div className="space-y-20">
              {displayedCategories.map((cat) => {
                const categoryPlans = allPlans.filter((p) => p.category === cat.id);
                if (categoryPlans.length === 0) return null;

                const CatIcon = cat.icon;

                return (
                  <div key={cat.id} className="scroll-mt-36" id={cat.id}>
                    {/* SECTION HEADING & 2-3 LINE CAPTION */}
                    <div className="mb-10 max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-sand/60 px-3.5 py-1 text-xs font-bold text-cocoa">
                        <CatIcon className="h-4 w-4" />
                        <span>{cat.badge}</span>
                      </div>

                      <h2 className="mt-3 font-display text-3xl font-black text-espresso sm:text-4xl">
                        {cat.heading}
                      </h2>

                      <p className="mt-3 text-base leading-relaxed text-body-text">
                        {cat.caption}
                      </p>
                    </div>

                    {/* PLAN CARDS GRID */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {categoryPlans.map((plan, idx) => {
                        const isFeatured = plan.featured;

                        // Displayed Price based on billing toggle
                        const displayPrice =
                          billingCycle === "annual" && plan.priceAnnual
                            ? plan.priceAnnual
                            : plan.priceMonthly || plan.priceOneTime;

                        return (
                          <Reveal key={plan.id} delay={idx * 80}>
                            <div className="scene-3d h-full">
                              <div
                                className={`card-3d relative flex h-full flex-col justify-between rounded-3xl border p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-luxury ${
                                  isFeatured
                                    ? "border-copper bg-espresso text-cream ring-2 ring-copper/30"
                                    : "border-espresso/12 bg-white text-espresso"
                                }`}
                              >
                                {plan.popularBadge && (
                                  <span
                                    className={`absolute -top-3.5 right-6 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${
                                      isFeatured
                                        ? "bg-copper text-espresso"
                                        : "bg-cocoa text-white"
                                    }`}
                                  >
                                    {plan.popularBadge}
                                  </span>
                                )}

                                <div>
                                  {/* Plan Title & Tagline */}
                                  <div className="flex items-center justify-between gap-2">
                                    <h3
                                      className={`font-display text-xl font-black ${
                                        isFeatured ? "text-cream" : "text-espresso"
                                      }`}
                                    >
                                      {plan.name}
                                    </h3>
                                  </div>

                                  <p
                                    className={`mt-1 text-xs leading-normal ${
                                      isFeatured ? "text-cream/70" : "text-espresso/60"
                                    }`}
                                  >
                                    {plan.tagline}
                                  </p>

                                  {/* Price Tag */}
                                  <div className="mt-6 flex items-baseline gap-1.5">
                                    <span
                                      className={`font-display text-4xl font-extrabold tracking-tight ${
                                        isFeatured ? "text-white" : "text-espresso"
                                      }`}
                                    >
                                      {displayPrice}
                                    </span>
                                    {plan.pricePeriod && (
                                      <span
                                        className={`text-xs font-semibold ${
                                          isFeatured ? "text-cream/60" : "text-espresso/50"
                                        }`}
                                      >
                                        / {billingCycle === "annual" ? "mo (billed annually)" : plan.pricePeriod}
                                      </span>
                                    )}
                                  </div>

                                  <p
                                    className={`mt-3 text-xs leading-relaxed ${
                                      isFeatured ? "text-cream/80" : "text-foreground/75"
                                    }`}
                                  >
                                    {plan.description}
                                  </p>

                                  {/* Feature Checklist */}
                                  <div
                                    className={`my-6 h-px w-full ${
                                      isFeatured ? "bg-white/10" : "bg-espresso/10"
                                    }`}
                                  />

                                  <p
                                    className={`text-[11px] font-bold uppercase tracking-wider ${
                                      isFeatured ? "text-copper" : "text-cocoa"
                                    }`}
                                  >
                                    What's included:
                                  </p>

                                  <ul className="mt-3 space-y-2.5 text-xs font-medium">
                                    {plan.features.map((feature, fIdx) => (
                                      <li key={fIdx} className="flex items-start gap-2.5">
                                        <CheckCircle2
                                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                                            isFeatured ? "text-copper" : "text-cocoa"
                                          }`}
                                        />
                                        <span className={isFeatured ? "text-cream/90" : "text-espresso/85"}>
                                          {feature}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* CTA Action Button */}
                                <div className="mt-8 pt-2">
                                  <Link
                                    to={plan.ctaUrl as "/contact"}
                                    onClick={() =>
                                      trackCTAClick(`Plan: ${plan.name}`, `pricing_${cat.id}`)
                                    }
                                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-sm font-bold shadow-soft transition-all duration-200 ${
                                      isFeatured
                                        ? "bg-[#2F8FFF] text-white hover:bg-[#1769C2] hover:shadow-luxury"
                                        : "bg-[#0B1726] text-white hover:bg-[#2F8FFF] hover:shadow-luxury"
                                    }`}
                                  >
                                    <span>{plan.ctaLabel}</span>
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          CUSTOM GUARANTEE & TRUST BANNER
      ========================================================= */}
      <section className="bg-white py-16 border-t border-espresso/10">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-3xl border border-espresso/10 bg-sand/30 p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cocoa text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-espresso">Transparent SLAs</h4>
                <p className="mt-1 text-xs text-body-text leading-relaxed">
                  Every proposal includes clear milestone deliverables, code ownership rights, and dedicated post-launch support guarantees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-espresso/10 bg-sand/30 p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cocoa text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-espresso">Meta & Ads Ready</h4>
                <p className="mt-1 text-xs text-body-text leading-relaxed">
                  All platforms come pre-configured with first-party attribution tracking, Meta CAPI, and lead CRM synchronization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-espresso/10 bg-sand/30 p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cocoa text-white">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-espresso">Need a Custom Quote?</h4>
                <p className="mt-1 text-xs text-body-text leading-relaxed">
                  Have complex enterprise requirements or custom legacy migrations? Schedule a 1-on-1 architecture discovery call.
                </p>
                <Link
                  to="/book"
                  onClick={() => trackCTAClick("Book Custom Quote Call", "pricing_trust_banner")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cocoa hover:text-espresso"
                >
                  Book Discovery Call <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
