import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Search, Filter, Clock, Activity, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [{ title: "Audit Logs & Compliance — Admin" }],
  }),
  component: AdminAuditLogs,
});

interface AuditRecord {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  details: string | null;
  created_at: string;
}

function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter((l) =>
    (l.actor_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.details || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-espresso via-cocoa to-espresso p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sand">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> System Audit & Security Trail
            </span>
            <h1 className="mt-2 font-display text-2xl font-black">Audit Compliance & System Logs</h1>
            <p className="mt-1 text-xs text-sand/70">Track real-time security events, admin actions, client updates, and automated email triggers.</p>
          </div>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 rounded-full bg-sand px-5 py-2.5 text-xs font-bold text-espresso hover:bg-white shadow-md transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Audit Trail
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-card p-4 shadow-sm">
        <Search className="h-4 w-4 text-espresso/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs by user, action, or details..."
          className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/40"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl border border-espresso/10 bg-card p-6 shadow-sm overflow-hidden space-y-4">
        <h2 className="font-display text-base font-black text-espresso">Audit Records ({filteredLogs.length})</h2>

        {loading ? (
          <p className="py-8 text-center text-xs text-foreground/50">Loading audit trail...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="py-8 text-center text-xs text-foreground/50">No audit logs recorded matching search criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-wider text-espresso/60">
                  <th className="py-3 px-2">Timestamp</th>
                  <th className="py-3 px-2">Actor / User</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Action</th>
                  <th className="py-3 px-2">Target</th>
                  <th className="py-3 px-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/6 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-sand/20">
                    <td className="py-3 px-2 font-mono text-espresso/70 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 font-bold text-espresso">{log.actor_name || log.actor_id || "System"}</td>
                    <td className="py-3 px-2">
                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-bold text-espresso uppercase">
                        {log.actor_role || "system"}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-espresso capitalize">{log.action.replace(/_/g, " ")}</td>
                    <td className="py-3 px-2 font-mono text-espresso/60">{log.target_type || "N/A"}</td>
                    <td className="py-3 px-2 text-foreground/80">{log.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
