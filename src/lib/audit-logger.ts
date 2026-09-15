import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
}

/** Inserts a permanent audit log entry for security and operations tracking */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("audit_logs").insert({
      actor_id: entry.actorId,
      actor_name: entry.actorName,
      actor_role: entry.actorRole,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId || null,
      details: entry.details || null,
    });
  } catch (err) {
    console.warn("Audit logging error:", err);
  }
}
