import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Code2, Palette, Search, Share2, Sparkles, Building2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface TestRole {
  key: string;
  label: string;
  department: string;
  amId: string;
  portalPath: string;
  icon: typeof ShieldCheck;
  color: string;
  description: string;
}

export const TEST_ROLES: TestRole[] = [
  {
    key: "admin",
    label: "Admin Portal",
    department: "Executive",
    amId: "AM-ADM-10011107",
    portalPath: "/admin",
    icon: ShieldCheck,
    color: "bg-red-500 text-white",
    description: "Full system administration, users, audit logs & PWA settings",
  },
  {
    key: "client",
    label: "Client Portal",
    department: "External Client",
    amId: "AM-CLI-77121107",
    portalPath: "/clients/dashboard",
    icon: Building2,
    color: "bg-blue-600 text-white",
    description: "Projects, milestones, invoices, contracts, documents & support",
  },
  {
    key: "manager",
    label: "Project Manager",
    department: "Management",
    amId: "AM-STF-98401107",
    portalPath: "/staff/dashboard",
    icon: UserCheck,
    color: "bg-amber-600 text-white",
    description: "Assign tasks, project progress sliders, client approvals & group chat",
  },
  {
    key: "developer",
    label: "Developer Portal",
    department: "Engineering",
    amId: "AM-STF-48211107",
    portalPath: "/staff/dashboard",
    icon: Code2,
    color: "bg-emerald-600 text-white",
    description: "Dev sprint queue, interactive bug tracker & pre-flight deployment checklist",
  },
  {
    key: "designer",
    label: "UI/UX Designer",
    department: "Product Design",
    amId: "AM-STF-58201107",
    portalPath: "/staff/dashboard",
    icon: Palette,
    color: "bg-purple-600 text-white",
    description: "Figma design system, client UI revisions, design sign-offs & asset vault",
  },
  {
    key: "seo",
    label: "SEO Specialist",
    department: "Search Engine",
    amId: "AM-STF-69311107",
    portalPath: "/staff/dashboard",
    icon: Search,
    color: "bg-teal-600 text-white",
    description: "Live keyword rank tracker, SEO audit checklist & organic reporting",
  },
  {
    key: "smm",
    label: "Social Media Mgr",
    department: "Growth Marketing",
    amId: "AM-STF-74101107",
    portalPath: "/staff/dashboard",
    icon: Share2,
    color: "bg-pink-600 text-white",
    description: "Content calendar, campaign scheduler, social analytics & post approvals",
  },
  {
    key: "graphic-designer",
    label: "Graphic Designer",
    department: "Creative Studio",
    amId: "AM-STF-81021107",
    portalPath: "/staff/dashboard",
    icon: Sparkles,
    color: "bg-orange-600 text-white",
    description: "Creative request queue, format deliverables (SVG/PNG/PSD/AI) & brand vault",
  },
];

export function PortalRoleSwitcher({
  activeRoleKey,
  onSwitchRole,
}: {
  activeRoleKey?: string;
  onSwitchRole?: (roleKey: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedAmId, setCopiedAmId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelectRole = (r: TestRole) => {
    if (onSwitchRole) {
      onSwitchRole(r.key);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: r.portalPath as any });
    toast.success(`Switched to ${r.label} (${r.amId})`);
  };

  const copyAMID = (amId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(amId);
    setCopiedAmId(amId);
    toast.success(`AM ID ${amId} copied to clipboard!`);
    setTimeout(() => setCopiedAmId(null), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-3xl border border-espresso/20 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md">
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between gap-3 px-2 py-1"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="font-display text-xs font-black uppercase tracking-wider text-emerald-400">
              Live Interconnected Portal Switcher
            </p>
            <p className="text-[10px] text-zinc-400">Click to test all 8 portals & AM IDs live</p>
          </div>
        </div>
        <button className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Grid */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Select Portal to Explore:</p>
          <div className="grid gap-2">
            {TEST_ROLES.map((r) => {
              const Icon = r.icon;
              const isCurrent = activeRoleKey === r.key;
              return (
                <div
                  key={r.key}
                  onClick={() => handleSelectRole(r)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-2.5 transition ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-950/50"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold ${r.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-black text-white">{r.label}</p>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[10px] text-zinc-400">{r.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => copyAMID(r.amId, e)}
                    className="ml-2 flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-mono text-emerald-400 hover:bg-black/60"
                    title="Click to copy AM ID"
                  >
                    {copiedAmId === r.amId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-400" />}
                    {r.amId}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
