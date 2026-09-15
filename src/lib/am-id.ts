import { supabase } from "@/integrations/supabase/client";

/** Generates a deterministic or random unique AM ID string like AM984021107 or AM-CLI-7712 */
export function generateAMID(type: "client" | "staff" | "admin", seed?: string): string {
  const prefix = type === "client" ? "AM-CLI" : type === "staff" ? "AM-STF" : "AM-ADM";
  if (seed && seed.length >= 6) {
    const numericPart = Array.from(seed)
      .reduce((acc, char) => (acc + char.charCodeAt(0)) % 899999, 100000);
    return `${prefix}-${numericPart}1107`;
  }
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randNum}1107`;
}

export interface UserAMIdentity {
  am_id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  type: "client" | "staff" | "admin";
  avatar_url?: string;
}

/** Looks up a user in clients or staff members by AM ID or Name or Email */
export async function searchUserByAMID(query: string): Promise<UserAMIdentity[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: UserAMIdentity[] = [];

  // Search in portal_clients
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clients } = await (supabase.from as any)("portal_clients")
    .select("id, name, email, am_id")
    .or(`name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,am_id.ilike.%${trimmed}%`)
    .limit(10);

  if (clients) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clients.forEach((c: any) => {
      results.push({
        am_id: c.am_id || generateAMID("client", c.id),
        name: c.name,
        email: c.email,
        role: "Client",
        type: "client",
      });
    });
  }

  // Search in staff_members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase.from as any)("staff_members")
    .select("id, name, email, role, department, avatar_url, am_id")
    .or(`name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,am_id.ilike.%${trimmed}%`)
    .limit(10);

  if (staff) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    staff.forEach((s: any) => {
      results.push({
        am_id: s.am_id || generateAMID("staff", s.id),
        name: s.name,
        email: s.email,
        role: s.role || "Team Member",
        department: s.department || "development",
        type: "staff",
        avatar_url: s.avatar_url,
      });
    });
  }

  return results;
}
