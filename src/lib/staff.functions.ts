import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, cleanEmail, cleanPassword } from "./portal-helpers.server";

/** Create a team member portal account + login (admin only). */
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      name: string;
      email: string;
      password: string;
      job_title?: string;
      role: string;
      department?: string;
      phone?: string;
      modules: string[];
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const email = cleanEmail(data.email);
    const password = cleanPassword(data.password);
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("Team member name is required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: "staff", job_title: data.job_title ?? null },
    });
    if (authErr || !created?.user) throw new Error(authErr?.message ?? "Could not create login");

    const { data: row, error } = await supabaseAdmin
      .from("staff_members")
      .insert({
        user_id: created.user.id,
        name,
        email,
        job_title: data.job_title ?? null,
        role: data.role,
        department: data.department ?? null,
        phone: data.phone ?? null,
        modules: data.modules,
        active: true,
      })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(error.message);
    }

    await supabaseAdmin.from("staff_activities").insert({
      staff_id: row.id,
      action: "account_created",
      description: `Team portal account created for ${name} (${data.role})`,
      actor: "admin",
    });

    return { id: row.id as string };
  });

/** Reset a team member's password or login email (admin only). */
export const updateStaffCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { staffId: string; password?: string; email?: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: staff, error: sErr } = await supabaseAdmin
      .from("staff_members")
      .select("id, user_id")
      .eq("id", data.staffId)
      .maybeSingle();
    if (sErr || !staff) throw new Error("Team member not found");

    const patch: Record<string, string> = {};
    if (data.password) patch['password'] = cleanPassword(data.password);
    if (data.email) patch['email'] = cleanEmail(data.email);
    if (Object.keys(patch).length === 0) return { ok: true };

    if (staff.user_id) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(staff.user_id, patch);
      if (error) throw new Error(error.message);
    } else if (patch['email'] && patch['password']) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: patch['email'],
        password: patch['password'],
        email_confirm: true,
      });
      if (error || !created?.user) throw new Error(error?.message ?? "Could not create login");
      await supabaseAdmin.from("staff_members").update({ user_id: created.user.id }).eq("id", staff.id);
    } else {
      throw new Error("This team member has no login yet — set both email and password.");
    }

    if (patch['email']) await supabaseAdmin.from("staff_members").update({ email: patch['email'] }).eq("id", staff.id);

    await supabaseAdmin.from("staff_activities").insert({
      staff_id: staff.id,
      action: "credentials_updated",
      description: data.password ? "Password reset by admin" : "Login email updated by admin",
      actor: "admin",
    });

    return { ok: true };
  });

/** Delete a team member portal account, login and related data (admin only). */
export const deleteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { staffId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: staff } = await supabaseAdmin
      .from("staff_members")
      .select("id, user_id")
      .eq("id", data.staffId)
      .maybeSingle();
    if (!staff) throw new Error("Team member not found");

    await supabaseAdmin.from("staff_members").delete().eq("id", staff.id);
    if (staff.user_id) await supabaseAdmin.auth.admin.deleteUser(staff.user_id);
    return { ok: true };
  });
