import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, cleanEmail, cleanPassword } from "./portal-helpers.server";



/** Create a portal client + its login account (admin only). */
export const createClientAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; email: string; password: string; company?: string; phone?: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const email = cleanEmail(data.email);
    const password = cleanPassword(data.password);
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("Client name is required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: "client" },
    });
    if (authErr || !created?.user) throw new Error(authErr?.message ?? "Could not create login");

    const { data: row, error } = await supabaseAdmin
      .from("portal_clients")
      .insert({
        user_id: created.user.id,
        name,
        email,
        company: data.company ?? null,
        phone: data.phone ?? null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(error.message);
    }

    await supabaseAdmin.from("client_activities").insert({
      client_id: row.id,
      action: "account_created",
      description: `Portal account created for ${name}`,
      actor: "admin",
    });

    return { id: row.id as string };
  });

/** Reset a client's password or email (admin only). */
export const updateClientCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { clientId: string; password?: string; email?: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: client, error: cErr } = await supabaseAdmin
      .from("portal_clients")
      .select("id, user_id")
      .eq("id", data.clientId)
      .maybeSingle();
    if (cErr || !client) throw new Error("Client not found");

    const patch: Record<string, string> = {};
    if (data.password) patch['password'] = cleanPassword(data.password);
    if (data.email) patch['email'] = cleanEmail(data.email);
    if (Object.keys(patch).length === 0) return { ok: true };

    if (client.user_id) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(client.user_id, patch);
      if (error) throw new Error(error.message);
    } else if (patch['email'] && patch['password']) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: patch['email'],
        password: patch['password'],
        email_confirm: true,
      });
      if (error || !created?.user) throw new Error(error?.message ?? "Could not create login");
      await supabaseAdmin.from("portal_clients").update({ user_id: created.user.id }).eq("id", client.id);
    } else {
      throw new Error("This client has no login yet — set both email and password.");
    }

    if (patch['email']) await supabaseAdmin.from("portal_clients").update({ email: patch['email'] }).eq("id", client.id);

    await supabaseAdmin.from("client_activities").insert({
      client_id: client.id,
      action: "credentials_updated",
      description: data.password ? "Password reset by admin" : "Login email updated by admin",
      actor: "admin",
    });

    return { ok: true };
  });

/** Delete a client, their login and all related portal data (admin only). */
export const deleteClientAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { clientId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: client } = await supabaseAdmin
      .from("portal_clients")
      .select("id, user_id")
      .eq("id", data.clientId)
      .maybeSingle();
    if (!client) throw new Error("Client not found");

    await supabaseAdmin.from("portal_clients").delete().eq("id", client.id);
    if (client.user_id) await supabaseAdmin.auth.admin.deleteUser(client.user_id);
    return { ok: true };
  });
