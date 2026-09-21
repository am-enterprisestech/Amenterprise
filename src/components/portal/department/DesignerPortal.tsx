import React, { useState } from "react";
import { Palette, Figma, CheckCircle, RefreshCw, Image, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onRefresh: () => void;
}

export function DesignerPortal({ staff, tasks, onRefresh }: Props) {
  const [figmaUrl, setFigmaUrl] = useState("https://figma.com/@amenterprise");
  const [revisions, setRevisions] = useState([
    { id: "1", project: "E-Commerce Suite", notes: "Change hero CTA color to cocoa and adjust mobile padding.", status: "in_progress" },
    { id: "2", project: "SaaS Dashboard", notes: "Add dark mode toggle mockup preview.", status: "approved" },
  ]);

  const addRevision = () => {
    const project = prompt("Project Name (e.g., Mobile App UI):");
    if (!project) return;
    const notes = prompt("Design revision notes:");
    setRevisions([...revisions, { id: Date.now().toString(), project, notes: notes || "UI Update", status: "in_progress" }]);
    toast.success("New design revision ticket submitted!");
  };

  const toggleApproval = (id: string) => {
    setRevisions(revisions.map((r) => (r.id === id ? { ...r, status: r.status === "approved" ? "in_progress" : "approved" } : r)));
    toast.info("Design approval status updated!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Palette className="h-3.5 w-3.5" /> UI/UX Design Studio
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — Design Portal</h1>
            <p className="mt-1 text-xs text-purple-200/70">Figma design system, client UI revisions, asset vault, and sign-offs.</p>
          </div>
          <a
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-purple-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-purple-300 shadow-md transition"
          >
            <Figma className="h-4 w-4" /> Open Figma <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Revision Queue */}
      <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-black text-espresso">Client Design Revisions & Feedback</h3>
          <button
            onClick={addRevision}
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-950"
          >
            <Plus className="h-3.5 w-3.5" /> New Design Ticket
          </button>
        </div>

        <div className="divide-y divide-espresso/6">
          {revisions.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-bold text-espresso">{r.project}</p>
                <p className="text-xs text-foreground/60">{r.notes}</p>
              </div>
              <button
                onClick={() => toggleApproval(r.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${r.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                  }`}
              >
                {r.status === "approved" ? "✓ Approved by Client" : "In Progress"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
