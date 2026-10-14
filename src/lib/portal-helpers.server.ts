type AdminContext = {
  supabase: {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (
          col: string,
          val: string,
        ) => {
          eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown }> };
        };
      };
    };
  };
  userId: string;
};

/** Throws unless the caller has the admin role. */
export async function assertAdmin(context: AdminContext) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export function cleanEmail(v: unknown) {
  const email = String(v ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address");
  return email;
}

export function cleanPassword(v: unknown) {
  const pw = String(v ?? "");
  if (pw.length < 8) throw new Error("Password must be at least 8 characters");
  return pw;
}
