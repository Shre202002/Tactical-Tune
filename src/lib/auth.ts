import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { AppRole, PublicUser } from "./domain";

export type { AppRole, PublicUser };

export interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getCurrentUserFromSession } = await import("@/server/auth.server");
  return getCurrentUserFromSession();
});

export const signInWithPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  )
  .handler(async ({ data }) => {
    const { loginUser } = await import("@/server/auth.server");
    return loginUser(data);
  });

export const createAccount = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      fullName: z.string().min(1).max(120),
    }),
  )
  .handler(async ({ data }) => {
    const { registerUser } = await import("@/server/auth.server");
    return registerUser(data);
  });

const logoutServer = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutUser } = await import("@/server/auth.server");
  await logoutUser();
  return { success: true };
});

export function useAuth(): AuthState {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    staleTime: 30_000,
    retry: false,
  });

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = isSuperAdmin || user?.role === "admin";
  return {
    user,
    loading: isLoading,
    roles: user ? [user.role] : [],
    isAdmin,
    isSuperAdmin,
  };
}

export async function signOut() {
  await logoutServer();
  window.location.href = "/";
}
