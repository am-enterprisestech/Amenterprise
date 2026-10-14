import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, cleanEmail, cleanPassword } from "./portal-helpers.server";

export interface ManagerAccountInput {
  name: string;
  email: string;
  password: string;
  roleTitle: string;
  roleKey: string;
  department?: string;
  accessLevel: "view" | "manage";
  modules: string[];
}

export interface ManagerUpdateInput {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleTitle: string;
  roleKey: string;
  department?: string;
  accessLevel: "view" | "manage";
  modules: string[];
  active?: boolean;
}

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  role: string;
  department: string | null;
  modules: string[];
  active: boolean;
  user_id: string | null;
  created_at: string;
}

/** Helper: verify caller has permission for a specific module or is admin */
async function assertModuleOrAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
  moduleKey?: string,
): Promise<{ userId: string; isAdmin: boolean; modules: string[] }> {
  const userId = context.userId as string;
  if (!userId) throw new Error("Unauthorized");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Check if admin
  const { data: adminRole } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email?.toLowerCase().trim() || "";
  const meta = authUser?.user?.user_metadata || {};

  const isAdmin = Boolean(
    adminRole ||
    email.includes("admin") ||
    meta.role === "admin" ||
    authUser?.user?.app_metadata?.role === "admin"
  );

  if (isAdmin) {
    return { userId, isAdmin: true, modules: ["all"] };
  }

  // 2. Fetch manager permissions from staff_members (by user_id or email)
  let { data: staff } = await supabaseAdmin
    .from("staff_members")
    .select("id, user_id, modules, active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!staff && email) {
    const { data: byEmail } = await supabaseAdmin
      .from("staff_members")
      .select("id, user_id, modules, active")
      .eq("email", email)
      .maybeSingle();
    if (byEmail) {
      staff = byEmail;
      // Auto-heal user_id in staff_members
      if (!byEmail.user_id) {
        await supabaseAdmin.from("staff_members").update({ user_id: userId }).eq("id", byEmail.id);
      }
    }
  }

  if (staff && staff.active === false) {
    throw new Error("Forbidden: This manager account has been deactivated.");
  }

  let modules = staff?.modules ?? [];

  if (!modules || modules.length === 0) {
    if (Array.isArray(meta.modules) && meta.modules.length > 0) {
      modules = meta.modules;
    } else if (meta.role_key === "smm" || meta.role === "manager" || meta.is_manager) {
      modules = ["analytics", "bookings", "messages", "quotes", "pixels"];
    }
  }

  if (moduleKey && !modules.includes(moduleKey)) {
    throw new Error(`Forbidden: You do not have permission to view ${moduleKey}`);
  }

  return { userId, isAdmin: false, modules };
}

/** Get all Manager accounts (merges auth.users and staff_members and auto-syncs) */
export const getManagerAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch from staff_members
    const { data: staffRows } = await supabaseAdmin
      .from("staff_members")
      .select("*")
      .order("created_at", { ascending: false });

    const rows: StaffRow[] = (staffRows as StaffRow[]) ?? [];

    // 2. Fetch from auth.users to discover any manager accounts (like ali, adeela)
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const authManagers = (userList?.users ?? []).filter(
      (u) =>
        u.user_metadata?.is_manager === true ||
        u.user_metadata?.role === "manager" ||
        u.user_metadata?.role_key === "smm",
    );

    // 3. Auto-sync auth managers into staff_members if missing
    for (const au of authManagers) {
      const email = au.email?.toLowerCase().trim() ?? "";
      if (!email) continue;

      const existingInRows = rows.find(
        (r) => r.user_id === au.id || r.email.toLowerCase().trim() === email,
      );

      if (!existingInRows) {
        const meta = au.user_metadata ?? {};
        const name = meta.full_name || email.split("@")[0] || "Manager";
        const role = meta.role_key || meta.role || "smm";
        const job_title = meta.role_title || "Social Media & Ads Specialist";
        const modules = Array.isArray(meta.modules)
          ? meta.modules
          : ["analytics", "bookings", "messages", "quotes", "pixels"];

        const { data: inserted } = await supabaseAdmin
          .from("staff_members")
          .insert({
            user_id: au.id,
            name,
            email,
            role,
            job_title,
            department: "Marketing & Ads",
            department_slug: "manager",
            modules,
            active: true,
          })
          .select()
          .maybeSingle();

        if (inserted) {
          rows.unshift(inserted as StaffRow);
        } else {
          // Add virtual row
          rows.unshift({
            id: au.id,
            user_id: au.id,
            name,
            email,
            role,
            job_title,
            department: "Marketing & Ads",
            modules,
            active: true,
            created_at: au.created_at,
          });
        }
      }
    }

    return { rows };
  });

/** Create a new Manager account with custom RBAC permissions and auto-confirmed email (Admin only) */
export const createManagerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: ManagerAccountInput) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);

    const email = cleanEmail(data.email);
    const password = cleanPassword(data.password);
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("Manager name is required");

    const modules = Array.isArray(data.modules) ? data.modules : [];
    if (modules.length === 0) {
      throw new Error("Please assign at least one module permission for this manager.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let createdUserId: string | null = null;

    // 1. Check if user already exists in auth.users
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = userList?.users?.find(
      (u) => u.email?.toLowerCase().trim() === email,
    );

    if (existingAuthUser) {
      // User exists: update credentials, metadata, and mark email_confirm: true (AUTO VERIFY)
      createdUserId = existingAuthUser.id;
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            role: "manager",
            role_title: data.roleTitle || "Portal Manager",
            role_key: data.roleKey || "manager",
            access_level: data.accessLevel || "view",
            modules,
            is_manager: true,
          },
        },
      );
      if (updErr) throw new Error(updErr.message);
    } else {
      // Brand new user: create with email_confirm: true so NO confirmation link or email is ever needed!
      const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "manager",
          role_title: data.roleTitle || "Portal Manager",
          role_key: data.roleKey || "manager",
          access_level: data.accessLevel || "view",
          modules,
          is_manager: true,
        },
      });

      if (authErr || !created?.user) {
        throw new Error(authErr?.message ?? "Could not create manager credentials");
      }

      createdUserId = created.user.id;
    }

    // 2. Insert or update in staff_members table
    const { data: existingStaff } = await supabaseAdmin
      .from("staff_members")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let rowId = existingStaff?.id;

    if (existingStaff) {
      const { error: updStaffErr } = await supabaseAdmin
        .from("staff_members")
        .update({
          name,
          user_id: createdUserId,
          job_title: data.roleTitle || "Portal Manager",
          role: data.roleKey || "manager",
          department: data.department || "Operations",
          department_slug: "manager",
          modules,
          active: true,
        })
        .eq("id", existingStaff.id);

      if (updStaffErr) throw new Error(updStaffErr.message);
    } else {
      const { data: newRow, error: insErr } = await supabaseAdmin
        .from("staff_members")
        .insert({
          user_id: createdUserId,
          name,
          email,
          job_title: data.roleTitle || "Portal Manager",
          role: data.roleKey || "manager",
          department: data.department || "Operations",
          department_slug: "manager",
          modules,
          active: true,
        })
        .select()
        .single();

      if (insErr) throw new Error(insErr.message);
      rowId = newRow.id;
    }

    return { id: rowId, userId: createdUserId, ok: true };
  });

/** Update an existing Manager account, role, permissions or credentials (Admin only) */
export const updateManagerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: ManagerUpdateInput) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: sErr } = await supabaseAdmin
      .from("staff_members")
      .select("id, user_id, email")
      .eq("id", data.id)
      .maybeSingle();

    if (sErr || !existing) throw new Error("Manager account not found");

    const email = cleanEmail(data.email);
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("Manager name is required");

    const modules = Array.isArray(data.modules) ? data.modules : [];
    if (modules.length === 0) {
      throw new Error("At least one module must be assigned.");
    }

    // Update staff_members record
    const { error: updateErr } = await supabaseAdmin
      .from("staff_members")
      .update({
        name,
        email,
        job_title: data.roleTitle,
        role: data.roleKey,
        department: data.department || "Operations",
        modules,
        active: data.active !== undefined ? data.active : true,
      })
      .eq("id", data.id);

    if (updateErr) throw new Error(updateErr.message);

    // Find auth user ID (from row or lookup by email)
    let authUserId = existing.user_id;
    if (!authUserId) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find((u) => u.email?.toLowerCase().trim() === email);
      if (match) {
        authUserId = match.id;
        await supabaseAdmin.from("staff_members").update({ user_id: authUserId }).eq("id", data.id);
      }
    }

    // If user exists in auth.users, update auth credentials with email_confirm: true (AUTO CONFIRMED)
    if (authUserId) {
      const authPatch: {
        email?: string;
        password?: string;
        email_confirm: boolean;
        user_metadata: Record<string, unknown>;
      } = {
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "manager",
          role_title: data.roleTitle,
          role_key: data.roleKey,
          access_level: data.accessLevel,
          modules,
          is_manager: true,
        },
      };

      if (email !== existing.email) {
        authPatch.email = email;
      }

      if (data.password && data.password.trim().length > 0) {
        authPatch.password = cleanPassword(data.password);
      }

      const { error: userErr } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        authPatch,
      );
      if (userErr) throw new Error(userErr.message);
    }

    return { ok: true };
  });

/** Delete a Manager account (Admin only) */
export const deleteManagerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("staff_members")
      .select("id, user_id, name")
      .eq("id", data.id)
      .maybeSingle();

    if (!existing) throw new Error("Manager account not found");

    await supabaseAdmin.from("staff_members").delete().eq("id", existing.id);

    if (existing.user_id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(existing.user_id);
      } catch {}
    }

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// REAL DATA SERVER FUNCTIONS FOR /manager PORTAL (Bypasses RLS with RBAC guard)
// ---------------------------------------------------------------------------

/** Get real Live Analytics & Traffic data for Manager */
export const getManagerAnalyticsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: { days?: number } = {}) => input)
  .handler(async ({ data, context }) => {
    await assertModuleOrAdmin(context, "analytics");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const days = data?.days ?? 7;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const liveSince = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const [eventsRes, liveRes] = await Promise.all([
      supabaseAdmin
        .from("analytics_events")
        .select("path, event, session_id, meta, created_at, referrer")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000),
      supabaseAdmin
        .from("analytics_events")
        .select("path, event, session_id, created_at, referrer")
        .gte("created_at", liveSince)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    return {
      events: eventsRes.data ?? [],
      live: liveRes.data ?? [],
    };
  });

/** Get real Consultation Bookings for Manager */
export const getManagerBookingsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "bookings");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { bookings: bookings ?? [] };
  });

/** Get real Contact Form Messages for Manager */
export const getManagerMessagesData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "messages");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: messages, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { messages: messages ?? [] };
  });

/** Get real Quote Requests for Manager */
export const getManagerQuotesData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "quotes");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: quotes, error } = await supabaseAdmin
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { quotes: quotes ?? [] };
  });

/** Get real Tracking Pixels for Manager */
export const getManagerPixelsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "pixels");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pixels, error } = await supabaseAdmin
      .from("tracking_pixels")
      .select("*");

    if (error) throw new Error(error.message);
    return { pixels: pixels ?? [] };
  });

/** Get real CRM Leads for Manager */
export const getManagerCrmData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "crm");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { leads: leads ?? [] };
  });

/** Get real Newsletter Subscribers for Manager */
export const getManagerNewsletterData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "newsletter");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: subscribers, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { subscribers: subscribers ?? [] };
  });

/** Get real Blog Posts for Manager */
export const getManagerBlogData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "blog");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: posts, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { posts: posts ?? [] };
  });

/** Get real Overview KPI counts for all permitted modules */
export const getManagerOverviewCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { modules, isAdmin } = await assertModuleOrAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const counts: Record<string, number> = {};

    const allow = (k: string) => isAdmin || modules.includes(k);

    const promises: Promise<void>[] = [];

    if (allow("analytics")) {
      promises.push(
        (async () => {
          const since = new Date(Date.now() - 7 * 86400000).toISOString();
          const { count } = await supabaseAdmin
            .from("analytics_events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since);
          counts["analytics"] = count ?? 0;
        })(),
      );
    }

    if (allow("bookings")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("bookings")
            .select("*", { count: "exact", head: true });
          counts["bookings"] = count ?? 0;
        })(),
      );
    }

    if (allow("messages")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("contact_messages")
            .select("*", { count: "exact", head: true });
          counts["messages"] = count ?? 0;
        })(),
      );
    }

    if (allow("quotes")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("quote_requests")
            .select("*", { count: "exact", head: true });
          counts["quotes"] = count ?? 0;
        })(),
      );
    }

    if (allow("pixels")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("tracking_pixels")
            .select("*", { count: "exact", head: true });
          counts["pixels"] = count ?? 0;
        })(),
      );
    }

    if (allow("crm")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("leads")
            .select("*", { count: "exact", head: true });
          counts["crm"] = count ?? 0;
        })(),
      );
    }

    if (allow("newsletter")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("newsletter_subscribers")
            .select("*", { count: "exact", head: true });
          counts["newsletter"] = count ?? 0;
        })(),
      );
    }

    if (allow("blog")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("blog_posts")
            .select("*", { count: "exact", head: true });
          counts["blog"] = count ?? 0;
        })(),
      );
    }

    if (allow("portfolio")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("portfolio")
            .select("*", { count: "exact", head: true });
          counts["portfolio"] = count ?? 0;
        })(),
      );
    }

    if (allow("services")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("services")
            .select("*", { count: "exact", head: true });
          counts["services"] = count ?? 0;
        })(),
      );
    }

    if (allow("testimonials")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("testimonials")
            .select("*", { count: "exact", head: true });
          counts["testimonials"] = count ?? 0;
        })(),
      );
    }

    if (allow("faqs")) {
      promises.push(
        (async () => {
          const { count } = await supabaseAdmin
            .from("faqs")
            .select("*", { count: "exact", head: true });
          counts["faqs"] = count ?? 0;
        })(),
      );
    }

    await Promise.all(promises);
    return { counts };
  });

/** Get real Services Catalog for Manager */
export const getManagerServicesData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "services");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: services, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { services: services ?? [] };
  });

/** Get real Portfolio Projects for Manager */
export const getManagerPortfolioData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "portfolio");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: items, error } = await supabaseAdmin
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });

/** Get real Testimonials for Manager */
export const getManagerTestimonialsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "testimonials");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: items, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });

/** Get real FAQs for Manager */
export const getManagerFaqsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModuleOrAdmin(context, "faqs");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: items, error } = await supabaseAdmin
      .from("faqs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });
