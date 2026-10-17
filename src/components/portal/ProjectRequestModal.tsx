import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  X, Sparkles, Code2, Smartphone, Bot, Palette, Rocket, Cloud,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2, DollarSign, Calendar, FileText
} from "lucide-react";

const SERVICES = [
  {
    id: "web_development",
    title: "Full-Stack Web App",
    desc: "Next.js / React, TanStack, Node APIs, high-speed architectures.",
    icon: Code2,
    badge: "Popular",
  },
  {
    id: "mobile_app",
    title: "Mobile App (iOS & Android)",
    desc: "Native & Cross-platform Flutter / React Native applications.",
    icon: Smartphone,
    badge: "Cross-Platform",
  },
  {
    id: "ai_automation",
    title: "AI & Workflow Automation",
    desc: "Autonomous LLM agents, automated pipelines, CRM & ERP sync.",
    icon: Bot,
    badge: "Advanced AI",
  },
  {
    id: "ui_ux_design",
    title: "UI/UX & Design Systems",
    desc: "World-class Figma designs, interactive prototypes, luxury brand identity.",
    icon: Palette,
    badge: "Design",
  },
  {
    id: "cloud_devops",
    title: "Cloud & DevOps Engineering",
    desc: "AWS / GCP / Vercel cloud architecture, CI/CD, microservices, scaling.",
    icon: Cloud,
    badge: "Cloud",
  },
  {
    id: "seo_growth",
    title: "SEO & Growth Engine",
    desc: "Technical SEO, site speed 100/100, programmatic landing pages.",
    icon: Rocket,
    badge: "Growth",
  },
];

const BUDGETS = [
  { label: "$1,500 – $5,000", sub: "Starter / MVP Sprint" },
  { label: "$5,000 – $15,000", sub: "Growth & Production Scale" },
  { label: "$15,000 – $40,000", sub: "Comprehensive Enterprise Solution" },
  { label: "$40,000+", sub: "Full Dedicated Engineering Team" },
];

const TIMELINES = [
  { label: "Urgent Sprint (1–2 Weeks)", sub: "Priority fast-track delivery" },
  { label: "Standard Delivery (3–5 Weeks)", sub: "Standard agile milestones" },
  { label: "Quarterly Roadmap (2–3 Months)", sub: "Phased rollout" },
  { label: "Ongoing Monthly Retainer", sub: "Continuous development & maintenance" },
];

export function ProjectRequestModal({
  clientId,
  clientName,
  isOpen,
  onClose,
  onCreated,
}: {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [service, setService] = useState(SERVICES[0].id);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(BUDGETS[1].label);
  const [timeline, setTimeline] = useState(TIMELINES[1].label);
  const [description, setDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);

    try {
      const selectedSvc = SERVICES.find((s) => s.id === service);
      const summaryText = `[Budget: ${budget}] · [Timeline: ${timeline}]\n\n${description}${referenceUrl ? `\n\nReference: ${referenceUrl}` : ""}`;

      // 1. Insert into projects table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: proj, error: projErr } = await (supabase.from as any)("projects").insert({
        client_id: clientId,
        title: title.trim(),
        service: selectedSvc?.title || "Custom Engineering",
        status: "planning",
        progress: 5,
        summary: summaryText,
      }).select("id").single();

      if (projErr) throw projErr;

      const projectId = proj?.id;
      setCreatedProjectId(projectId);

      // 2. Insert initial kickoff milestone
      if (projectId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)("project_milestones").insert([
          {
            project_id: projectId,
            title: "Phase 1: Architecture, Scope & Design Approval",
            description: "Kickoff call, wireframes, technical specs and milestone approval.",
            status: "in_progress",
            sort_order: 1,
          },
          {
            project_id: projectId,
            title: "Phase 2: Core Engineering & Database Implementation",
            description: "Full stack feature development and API wiring.",
            status: "pending",
            sort_order: 2,
          },
          {
            project_id: projectId,
            title: "Phase 3: QA, Staging Review & Final Deployment",
            description: "Live acceptance testing, security audit, and production release.",
            status: "pending",
            sort_order: 3,
          },
        ]);
      }

      // 3. Log client activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: clientId,
        action: "project_requested",
        description: `Requested new project: "${title.trim()}" (${selectedSvc?.title})`,
      });

      // 4. Create support notification
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_notifications").insert({
        client_id: clientId,
        title: "Project Request Received",
        body: `Your project "${title.trim()}" has been submitted to the AM Delivery Team. Your Solution Architect will review and schedule kickoff within 24 hours.`,
        kind: "project",
        is_read: false,
      });

      setDone(true);
      if (onCreated) onCreated();
    } catch (err) {
      alert((err as Error).message || "Could not submit project request");
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setStep(1);
    setTitle("");
    setDescription("");
    setReferenceUrl("");
    setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-[#12344D] to-[#1E4D70] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-[#20BFEA]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white">Start a New Project</h2>
              <p className="text-xs text-white/75">Enterprise Solution Architect Review &amp; Dedicated Delivery</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Screen */}
        {done ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-black text-foreground">Project Request Submitted!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-bold text-foreground">{clientName}</span>. Your project request has been logged into the AM Enterprises engineering roadmap.
            </p>
            <div className="rounded-2xl border border-border bg-muted/40 p-4 max-w-md mx-auto text-left text-xs space-y-1 font-mono">
              <p><span className="text-muted-foreground font-sans">Project:</span> <strong className="font-bold text-foreground font-sans">{title}</strong></p>
              <p><span className="text-muted-foreground font-sans">Scope:</span> <span className="text-primary font-sans">{SERVICES.find(s => s.id === service)?.title}</span></p>
              <p><span className="text-muted-foreground font-sans">Status:</span> <span className="text-amber-600 font-sans font-bold">Planning &amp; Architecture Review</span></p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
              >
                Go to Projects Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Step Progress Indicators */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</span>
                <span className={`text-xs font-bold ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>Select Service</span>
              </div>
              <div className="h-0.5 flex-1 bg-border mx-3" />
              <div className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                <span className={`text-xs font-bold ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>Budget &amp; Timeline</span>
              </div>
              <div className="h-0.5 flex-1 bg-border mx-3" />
              <div className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                <span className={`text-xs font-bold ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>Project Brief</span>
              </div>
            </div>

            {/* STEP 1: SELECT SERVICE */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-black text-foreground text-base">What kind of project are we building?</h3>
                  <p className="text-xs text-muted-foreground">Choose the engineering capability that best fits your goals.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SERVICES.map((s) => {
                    const Icon = s.icon;
                    const isSelected = service === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setService(s.id)}
                        className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/20"
                        }`}
                      >
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-display font-bold text-foreground text-sm">{s.title}</p>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">{s.badge}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-md transition-all"
                  >
                    Next: Timeline &amp; Budget <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BUDGET & TIMELINE */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display font-black text-foreground text-base">Timeline &amp; Investment Bracket</h3>
                  <p className="text-xs text-muted-foreground">Helps us assemble the optimal squad and sprint schedule.</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Estimated Budget Target
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBudget(b.label)}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          budget === b.label
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-bold"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <p className="text-sm font-bold text-foreground">{b.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{b.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Target Delivery Velocity
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TIMELINES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setTimeline(t.label)}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          timeline === t.label
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-bold"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <p className="text-sm font-bold text-foreground">{t.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-md"
                  >
                    Next: Project Details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: BRIEF & SUBMIT */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-black text-foreground text-base">Project Overview &amp; Specifications</h3>
                  <p className="text-xs text-muted-foreground">Describe your vision, target users, or key deliverables.</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Project Title / Name *
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NextGen B2B Customer Portal & AI Analytics"
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Description &amp; Key Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe core features, target audience, technical preferences, or problems to solve..."
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reference URLs / Design Links (optional)
                  </label>
                  <input
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="e.g. Figma link, competitor website, or Google Drive folder"
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !title.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg disabled:opacity-60 transition-all"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    Submit Project for Kickoff
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
