import React, { useState } from "react";
import { Search, TrendingUp, BarChart2, CheckSquare, Shield, Plus, Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onRefresh: () => void;
}

export function SEOPortal({ staff, tasks, onRefresh }: Props) {
  const [keywords, setKeywords] = useState([
    { kw: "digital agency islamabad", rank: "#1", volume: "2,400/mo", status: "Top 3" },
    { kw: "web development software house", rank: "#3", volume: "5,100/mo", status: "Top 5" },
    { kw: "pwa development pakistan", rank: "#2", volume: "1,200/mo", status: "Top 3" },
  ]);

  const addKeyword = () => {
    const kw = prompt("Enter target search keyword:");
    if (!kw) return;
    const rank = prompt("Current Rank (e.g. #4):") || "#4";
    setKeywords([...keywords, { kw, rank, volume: "1,500/mo", status: "Tracking" }]);
    toast.success(`Keyword "${kw}" added to live rank tracking!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Search className="h-3.5 w-3.5" /> Organic Search & SEO Engine
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — SEO Operations</h1>
            <p className="mt-1 text-xs text-emerald-200/70">Keyword rank tracking, SEO audits, backlink tasks, and organic traffic reporting.</p>
          </div>
          <button
            onClick={() => toast.success("SEO Audit & Organic Traffic Report generated!")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 shadow-md transition"
          >
            <Download className="h-4 w-4" /> Download SEO Report
          </button>
        </div>
      </div>

      {/* Keywords Ranking Table */}
      <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-black text-espresso">Live Keyword Rank Tracking</h3>
          <button
            onClick={addKeyword}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-900"
          >
            <Plus className="h-3.5 w-3.5" /> Add Keyword
          </button>
        </div>

        <div className="divide-y divide-espresso/6">
          {keywords.map((k, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-espresso">{k.kw}</p>
                <p className="text-xs text-foreground/60">Search Volume: {k.volume}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-lg font-black text-emerald-700">{k.rank}</span>
                <p className="text-[10px] font-bold text-espresso/60">{k.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
