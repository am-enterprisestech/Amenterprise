import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface ManagerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  roleTitle: string;
  roleKey: string;
  department: string | null;
  modules: string[];
  accessLevel: "view" | "manage";
  active: boolean;
  isAdmin: boolean;
}

export function useManager() {
  const [user, setUser] = useState<User | null>(null);
  const [manager, setManager] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setManager(null);
      setLoading(false);
      return;
    }

    // 1. Check if user is super admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = Boolean(adminRole);

    // 2. Fetch staff_members profile (match by user_id or email)
    const emailNormalized = u.email ? u.email.toLowerCase().trim() : "";
    let staff: any = null;

    if (u.id) {
      const { data: byId } = await supabase
        .from("staff_members")
        .select("id, user_id, name, email, job_title, role, department, modules, active")
        .eq("user_id", u.id)
        .maybeSingle();
      if (byId) staff = byId;
    }

    if (!staff && emailNormalized) {
      const { data: byEmail } = await supabase
        .from("staff_members")
        .select("id, user_id, name, email, job_title, role, department, modules, active")
        .eq("email", emailNormalized)
        .maybeSingle();
      if (byEmail) {
        staff = byEmail;
        // Auto-link user_id if not linked
        if (!staff.user_id) {
          await supabase.from("staff_members").update({ user_id: u.id }).eq("id", staff.id);
        }
      }
    }

    const meta = u.user_metadata || {};

    if (staff) {
      const accessLevel = (meta.access_level as "view" | "manage") || "view";
      const modules = Array.isArray(staff.modules) && staff.modules.length > 0 
        ? staff.modules 
        : (Array.isArray(meta.modules) ? meta.modules : ["analytics", "bookings", "messages"]);

      setManager({
        id: staff.id,
        userId: u.id,
        name: staff.name || meta.full_name || u.email?.split("@")[0] || "Manager",
        email: staff.email || u.email || "",
        roleTitle: staff.job_title || meta.role_title || "Manager",
        roleKey: staff.role || meta.role_key || "manager",
        department: staff.department || "Operations",
        modules,
        accessLevel,
        active: staff.active ?? true,
        isAdmin,
      });
    } else if (isAdmin) {
      // Super Admin preview mode: full module privileges
      setManager({
        id: "admin-root",
        userId: u.id,
        name: meta.full_name || u.email?.split("@")[0] || "Administrator",
        email: u.email || "",
        roleTitle: "Super Administrator (Master Access)",
        roleKey: "admin",
        department: "Administration",
        modules: [
          "analytics",
          "bookings",
          "messages",
          "quotes",
          "pixels",
          "crm",
          "newsletter",
          "blog",
          "portfolio",
          "services",
          "testimonials",
          "faqs",
        ],
        accessLevel: "manage",
        active: true,
        isAdmin: true,
      });
    } else if (meta.is_manager) {
      // Fallback from user_metadata
      setManager({
        id: "meta-profile",
        userId: u.id,
        name: meta.full_name || u.email?.split("@")[0] || "Manager",
        email: u.email || "",
        roleTitle: meta.role_title || "Portal Manager",
        roleKey: meta.role_key || "manager",
        department: "Operations",
        modules: Array.isArray(meta.modules) ? meta.modules : ["analytics", "bookings", "messages"],
        accessLevel: (meta.access_level as "view" | "manage") || "view",
        active: true,
        isAdmin: false,
      });
    } else {
      setManager(null);
    }

    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    await loadProfile(data.user ?? null);
  }, [loadProfile]);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh, loadProfile]);

  const hasModule = useCallback(
    (moduleKey: string) => {
      if (!manager) return false;
      if (manager.isAdmin) return true;
      return manager.modules.includes(moduleKey);
    },
    [manager],
  );

  return { user, manager, loading, hasModule, refresh };
}
