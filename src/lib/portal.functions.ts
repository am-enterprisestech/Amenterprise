import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, cleanEmail, cleanPassword } from "./portal-helpers.server";

/**
 * Called on portal load by the signed-in client themselves.
 * If portal_clients has a row matching their email but user_id is NULL (broken link),
 * this heals it automatically so they can access the portal without admin intervention.
 */
export const selfHealPortalLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as { userId: string; supabase: { auth: { getUser: () => Promise<{ data: { user: { email?: string } | null } }> } } };
    const userId = ctx.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Get the auth user's email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (!email) return { healed: false };

    // Check if there's already a linked row
    const { data: linked } = await supabaseAdmin
      .from("portal_clients")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (linked) return { healed: false }; // already fine

    // Look for a row with matching email but no user_id
    const { data: unlinked } = await supabaseAdmin
      .from("portal_clients")
      .select("id")
      .eq("email", email)
      .is("user_id", null)
      .maybeSingle();
    if (!unlinked) return { healed: false }; // no row to heal

    // Patch the user_id
    await supabaseAdmin
      .from("portal_clients")
      .update({ user_id: userId })
      .eq("id", unlinked.id);

    await supabaseAdmin.from("client_activities").insert({
      client_id: unlinked.id,
      action: "account_linked",
      description: `Portal link auto-healed on login for ${email}`,
      actor: "system",
    });

    return { healed: true };
  });



/** Create a portal client + its login account (admin only). */
export const createClientAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { name: string; email: string; password: string; company?: string; phone?: string }) => input)
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
  .validator((input: { clientId: string; password?: string; email?: string }) => input)
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
  .validator((input: { clientId: string }) => input)
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

/**
 * Repair a broken portal link: find the auth user by email and set user_id on the
 * portal_clients row so the client can log in without touching Supabase manually.
 * Admin only.
 */
export const repairClientLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { clientId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Get the portal_clients row
    const { data: client, error: cErr } = await supabaseAdmin
      .from("portal_clients")
      .select("id, user_id, email, name")
      .eq("id", data.clientId)
      .maybeSingle();
    if (cErr || !client) throw new Error("Client not found");

    if (client.user_id) {
      // Already linked — verify the auth user still exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(client.user_id);
      if (existingUser?.user) return { ok: true, status: "already_linked" as const };
      // Auth user was deleted externally — clear the stale user_id and re-create below
      await supabaseAdmin.from("portal_clients").update({ user_id: null }).eq("id", client.id);
    }

    // 2. Look up auth user by email
    const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000, page: 1 });
    const existingAuthUser = (usersPage?.users ?? []).find(
      (u) => u.email?.toLowerCase() === client.email.toLowerCase(),
    );

    if (existingAuthUser) {
      // 3a. Auth user exists — just link it
      const { error } = await supabaseAdmin
        .from("portal_clients")
        .update({ user_id: existingAuthUser.id })
        .eq("id", client.id);
      if (error) throw new Error(error.message);

      await supabaseAdmin.from("client_activities").insert({
        client_id: client.id,
        action: "account_linked",
        description: `Portal link repaired — auth user ${existingAuthUser.id} linked to client record`,
        actor: "admin",
      });

      return { ok: true, status: "linked_existing" as const };
    }

    // 3b. No auth user found — throw a helpful error so admin knows to set credentials
    throw new Error(
      `No Supabase auth account found for ${client.email}. ` +
        `Use "Set password" in the Login credentials panel to create a login for this client.`,
    );
  });
