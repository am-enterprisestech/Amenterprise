import React, { useState } from "react";
import { Share2, Calendar, ThumbsUp, MessageCircle, BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staff: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onRefresh: () => void;
}

export function SMMPortal({ staff, tasks, onRefresh }: Props) {
  const [posts, setPosts] = useState([
    { id: "1", title: "Launch Announcement — AM Enterprise V3", platform: "LinkedIn / Twitter", date: "Sep 20, 2026", status: "scheduled" },
    { id: "2", title: "Why Businesses Need Interconnected Portals", platform: "Instagram Reel / TikTok", date: "Sep 22, 2026", status: "draft" },
  ]);

  const addPost = () => {
    const title = prompt("Campaign / Post Title:");
    if (!title) return;
    const platform = prompt("Platform (e.g., LinkedIn, Instagram, X):") || "LinkedIn";
    setPosts([...posts, { id: Date.now().toString(), title, platform, date: "Sep 25, 2026", status: "scheduled" }]);
    toast.success(`Social campaign "${title}" scheduled!`);
  };

  const toggleStatus = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: p.status === "scheduled" ? "published" : "scheduled" } : p
      )
    );
    toast.info("Campaign status updated!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-pink-900 via-rose-950 to-pink-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
              <Share2 className="h-3.5 w-3.5" /> Social Media & Growth Marketing
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">{staff.name} — SMM Portal</h1>
            <p className="mt-1 text-xs text-pink-200/70">Content calendar, campaign tracking, post approvals, and social analytics.</p>
          </div>
        </div>
      </div>

      {/* Content Calendar */}
      <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-black text-espresso">Scheduled Campaigns & Content Calendar</h3>
          <button
            onClick={addPost}
            className="inline-flex items-center gap-1.5 rounded-full bg-pink-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pink-950"
          >
            <Plus className="h-3.5 w-3.5" /> Schedule Social Post
          </button>
        </div>

        <div className="divide-y divide-espresso/6">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-espresso">{p.title}</p>
                <p className="text-xs text-foreground/60">Platform: {p.platform} · {p.date}</p>
              </div>
              <button
                onClick={() => toggleStatus(p.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
                  p.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}
              >
                {p.status === "published" ? "✓ Published" : "Scheduled"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
