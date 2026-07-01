import { redirect } from "next/navigation";
import { getCurrentUserFromSession } from "@/server/auth.server";
import type { ReactNode } from "react";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUserFromSession();
  if (!user) {
    redirect("/auth");
  }
  return <>{children}</>;
}
