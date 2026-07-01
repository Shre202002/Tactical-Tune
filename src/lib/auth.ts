"use server";

import type { PublicUser } from "./domain";


export async function getCurrentUser(): Promise<PublicUser | null> {
  const { getCurrentUserFromSession } = await import("@/server/auth.server");
  return getCurrentUserFromSession();
}

export async function signInWithPassword(input: { email: string; password: string }) {
  const { loginUser } = await import("@/server/auth.server");
  return loginUser(input);
}

export async function createAccount(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { registerUser } = await import("@/server/auth.server");
  return registerUser(input);
}

export async function signOut() {
  const { logoutUser } = await import("@/server/auth.server");
  await logoutUser();
}
