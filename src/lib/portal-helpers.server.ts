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
export async function assertAdmin(context: { userId: string }) {
  if (!context?.userId) throw new Error("Unauthorized");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Check user_roles table via supabaseAdmin (bypasses RLS)
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (data?.role === "admin") return;

  // 2. Fallback check: auth user metadata or admin email
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(context.userId);
  const user = authUser?.user;
  if (
    user?.email?.toLowerCase().includes("admin") ||
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin"
  ) {
    return;
  }

  throw new Error("Forbidden: Admin access required");
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
