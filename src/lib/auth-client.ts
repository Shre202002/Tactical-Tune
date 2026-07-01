"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import type { PublicUser, AppRole } from "@/lib/domain";
import { isStaffRole } from "@/lib/rbac";
export interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
}

export function useAuth(): AuthState {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    staleTime: 30_000,
    retry: false,
  });

  const isSuperAdmin = user?.role === "super_admin";
  const isStaff = user ? isStaffRole(user.role) : false;
  return {
    user,
    loading: isLoading,
    roles: user ? [user.role] : [],
    isAdmin: isStaff,
    isStaff,
    isSuperAdmin,
  };
}
