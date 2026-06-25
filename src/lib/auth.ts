import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "customer";

export interface AuthState {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Subscribe synchronously first.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      // Defer role fetch
      if (session?.user) {
        setTimeout(() => loadRoles(session.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    // Then hydrate from current session.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadRoles(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    async function loadRoles(uid: string) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!mounted) return;
      setRoles((data ?? []).map((r) => r.role as AppRole));
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");

  return { user, loading, roles, isAdmin, isSuperAdmin };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
