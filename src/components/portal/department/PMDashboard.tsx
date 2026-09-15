import React, { useState } from "react";
import { FolderGit2, CheckCircle2, Clock, Users, Plus, Edit, FileText, AlertCircle, TrendingUp, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { sendAutomatedEmail } from "@/lib/email-notifier";
import { logAudit } from "@/lib/audit-logger";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clients: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRefresh: () => void;
}

export function PMDashboard({ staff, projects, tasks, clients, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<"projects" | "tasks" | "approvals" | "team">("projects");
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    toast.success(`Task "${taskTitle}" assigned to ${taskAssignee || "team"}`);
    setShowNewTask(false);
    setTaskTitle("");

    // Trigger Automated Email
    if (selectedClient) {
      const clientObj = clients.find((c) => c.id === selectedClient);
      if (clientObj?.email) {
        await sendAutomatedEmail({
          toEmail: clientObj.email,
          recipientName: clientObj.name,
          subject: `New Milestone Task Created: ${taskTitle}`,
          category: "task",
          bodyText: `Your Project Manager ${staff.name} created a new milestone task "${taskTitle}" for your project.`,
          actionUrl: "/clients/dashboard",
        });
      }
    }

    logAudit({
      actorId: staff.id,
      actorName: staff.name,
      actorRole: "project_manager",
      action: "create_pm_task",
      targetType: "client_tasks",
      details: `PM assigned task ${taskTitle}`,
    });

    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* PM Banner */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-espresso via-cocoa to-espresso p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sand">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Project Management Portal
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — Project Manager Command</h1>
            <p className="mt-1 text-xs text-sand/70">Manage assigned projects, assign tasks to department leads, update progress, and client approvals.</p>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center gap-2 rounded-full bg-sand px-5 py-2.5 text-xs font-bold text-espresso hover:bg-white shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Create PM Task
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-espresso/10 bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-espresso/60">Active Projects</p>
          <p className="mt-2 font-display text-2xl font-black text-espresso">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-espresso/10 bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-espresso/60">Pending PM Tasks</p>
          <p className="mt-2 font-display text-2xl font-black text-espresso">{tasks.filter((t) => t.status !== "done").length}</p>
        </div>
        <div className="rounded-2xl border border-espresso/10 bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-espresso/60">Connected Clients</p>
          <p className="mt-2 font-display text-2xl font-black text-espresso">{clients.length}</p>
        </div>
        <div className="rounded-2xl border border-espresso/10 bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-espresso/60">Approvals Pending</p>
          <p className="mt-2 font-display text-2xl font-black text-emerald-700">3</p>
        </div>
      </div>

      {/* PM Tabs Navigation */}
      <div className="flex border-b border-espresso/15 gap-4">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "projects" ? "border-espresso text-espresso" : "border-transparent text-espresso/60 hover:text-espresso"}`}
        >
          All Assigned Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "tasks" ? "border-espresso text-espresso" : "border-transparent text-espresso/60 hover:text-espresso"}`}
        >
          PM Milestone Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-3 text-xs font-bold border-b-2 transition ${activeTab === "approvals" ? "border-espresso text-espresso" : "border-transparent text-espresso/60 hover:text-espresso"}`}
        >
          Client Approvals & Signoffs
        </button>
      </div>

      {/* Tab 1: Projects Overview */}
      {activeTab === "projects" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-espresso/10 px-3 py-1 text-[10px] font-bold text-espresso uppercase">{p.service || "Project"}</span>
                <span className="text-xs font-bold text-emerald-700 capitalize">{p.status}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-espresso">{p.title}</h3>
                <p className="text-xs text-foreground/60">{p.summary || "Complete digital ecosystem deployment."}</p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-espresso">
                  <span>Progress</span>
                  <span>{p.progress || 60}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-sand overflow-hidden">
                  <div className="h-full bg-espresso transition-all" style={{ width: `${p.progress || 60}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: PM Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-black text-espresso">Milestone & Department Task Assignments</h3>
          <div className="divide-y divide-espresso/6">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-espresso">{t.title}</p>
                  <p className="text-xs text-foreground/60">Assignee: {t.assignee || "Department Lead"}</p>
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-espresso capitalize">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create PM Task */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4" onClick={() => setShowNewTask(false)}>
          <form onSubmit={handleCreateTask} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-black text-espresso">Assign PM Milestone Task</h3>
            <div>
              <label className="text-[10px] font-semibold uppercase text-espresso/60">Task Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Complete Phase 1 API Specs..."
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/20 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase text-espresso/60">Assignee Department Lead</label>
              <input
                type="text"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                placeholder="e.g. Lead Developer / UI Designer"
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/20 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase text-espresso/60">Notify Client (Email Trigger)</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/20 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full rounded-full bg-espresso py-2.5 text-xs font-bold text-white hover:bg-cocoa">
              Assign Task & Dispatch Email
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
