import { z } from "zod";

export const auditInputSchema = z.object({ url: z.string().trim().min(4).max(400) });

export function normaliseAuditUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
