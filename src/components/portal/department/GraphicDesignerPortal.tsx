import React, { useState } from "react";
import { Image, Layers, Sparkles, CheckCircle, Download, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onRefresh: () => void;
}

export function GraphicDesignerPortal({ staff, tasks, onRefresh }: Props) {
  const [creatives, setCreatives] = useState([
    { id: "1", title: "App Store Mockup Banner (2560x1440)", format: "PNG / PSD", status: "completed" },
    { id: "2", title: "Vector Icon Set for Portal Dashboard", format: "SVG", status: "in_progress" },
  ]);

  const addCreative = () => {
    const title = prompt("Deliverable Asset Title:");
    if (!title) return;
    const format = prompt("Format (e.g., SVG, PNG, PSD, AI):") || "SVG / PNG";
    setCreatives([...creatives, { id: Date.now().toString(), title, format, status: "in_progress" }]);
    toast.success(`Creative asset ticket "${title}" created!`);
  };

  const toggleStatus = (id: string) => {
    setCreatives(
      creatives.map((c) =>
        c.id === id ? { ...c, status: c.status === "completed" ? "in_progress" : "completed" } : c
      )
    );
    toast.info("Deliverable status updated!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-amber-900 via-orange-950 to-amber-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> Creative Graphic Studio
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — Graphic Design Studio</h1>
            <p className="mt-1 text-xs text-amber-200/70">Creative request tickets, vector brand kit vault, graphic revisions, and approvals.</p>
          </div>
          <button
            onClick={() => toast.success("Brand Asset Kit (.ZIP) downloaded!")}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 shadow-md transition"
          >
            <Download className="h-4 w-4" /> Download Vector Brand Kit
          </button>
        </div>
      </div>

      {/* Creatives Queue */}
      <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-black text-espresso">Creative Request Queue & Deliverables</h3>
          <button
            onClick={addCreative}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-950"
          >
            <Plus className="h-3.5 w-3.5" /> New Creative Request
          </button>
        </div>

        <div className="divide-y divide-espresso/6">
          {creatives.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-espresso">{c.title}</p>
                <p className="text-xs text-foreground/60">Format: {c.format}</p>
              </div>
              <button
                onClick={() => toggleStatus(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
                  c.status === "completed" ? "bg-amber-100 text-amber-900" : "bg-orange-100 text-orange-900"
                }`}
              >
                {c.status === "completed" ? "✓ Completed & Exported" : "In Progress"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
