import React, { useState } from "react";
import { Code2, GitBranch, Bug, Terminal, CheckSquare, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onRefresh: () => void;
}

export function DeveloperPortal({ staff, tasks, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<"tasks" | "bugs" | "deployments" | "repos">("tasks");
  const [repoUrl, setRepoUrl] = useState("https://github.com/aymoxi/apex-tech-premier-suite");
  const [bugs, setBugs] = useState([
    { id: "1", title: "Supabase Realtime disconnect on long idle", priority: "high", status: "open" },
    { id: "2", title: "Fix hydration mismatch in server function", priority: "medium", status: "resolved" },
  ]);
  const [checklist, setChecklist] = useState([
    { id: "1", label: "Run build check (npm run build)", checked: true },
    { id: "2", label: "Apply database schema migrations", checked: true },
    { id: "3", label: "Verify Supabase RLS security policies", checked: true },
    { id: "4", label: "Test PWA webmanifest & App Icon loading", checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(checklist.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  };

  return (
    <div className="space-y-6">
      {/* Dev Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Code2 className="h-3.5 w-3.5" /> Developer Engineering Portal
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — Engineering Workspace</h1>
            <p className="mt-1 text-xs text-zinc-400">Code repositories, deployment checklists, bug tracking, and developer tasks.</p>
          </div>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md transition"
          >
            <GitBranch className="h-4 w-4" /> Open Repository <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-espresso/15 gap-4">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "tasks" ? "border-espresso text-espresso" : "border-transparent text-espresso/60"}`}
        >
          Dev Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("bugs")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "bugs" ? "border-espresso text-espresso" : "border-transparent text-espresso/60"}`}
        >
          Bug Tracker ({bugs.length})
        </button>
        <button
          onClick={() => setActiveTab("deployments")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "deployments" ? "border-espresso text-espresso" : "border-transparent text-espresso/60"}`}
        >
          Deployment Checklist
        </button>
      </div>

      {/* Dev Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-black text-espresso">Dev Sprint Queue</h3>
          <div className="divide-y divide-espresso/6">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-espresso">{t.title}</p>
                  <p className="text-xs text-foreground/60">Priority: {t.priority || "Medium"}</p>
                </div>
                <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold capitalize">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bug Tracker */}
      {activeTab === "bugs" && (
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-black text-espresso">Active Bug Issues</h3>
            <button
              onClick={() => {
                const title = prompt("Enter bug description:");
                if (title) {
                  setBugs([...bugs, { id: Date.now().toString(), title, priority: "high", status: "open" }]);
                  toast.success("Bug issue logged!");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cocoa"
            >
              <Plus className="h-3.5 w-3.5" /> Log Bug Issue
            </button>
          </div>

          <div className="divide-y divide-espresso/6">
            {bugs.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Bug className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-bold text-espresso">{b.title}</p>
                    <span className="text-[10px] uppercase font-bold text-red-600">{b.priority} PRIORITY</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setBugs(bugs.map((x) => (x.id === b.id ? { ...x, status: x.status === "resolved" ? "open" : "resolved" } : x)));
                    toast.info(`Bug status updated to ${b.status === "resolved" ? "open" : "resolved"}`);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${b.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                >
                  {b.status === "resolved" ? "✓ Resolved" : "Open Issue"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployment Checklist */}
      {activeTab === "deployments" && (
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-black text-espresso">Pre-Flight Production Checklist</h3>
          <div className="space-y-3">
            {checklist.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-2xl border border-espresso/10 p-4 bg-sand/20 cursor-pointer hover:bg-sand/40">
                <input
                  type="checkbox"
                  checked={c.checked}
                  onChange={() => toggleCheck(c.id)}
                  className="h-4 w-4 rounded accent-espresso"
                />
                <span className={`text-sm font-bold ${c.checked ? "line-through text-foreground/50" : "text-espresso"}`}>{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
