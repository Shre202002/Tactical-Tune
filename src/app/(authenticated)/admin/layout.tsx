import { redirect } from "next/navigation";
import { getCurrentUserFromSession } from "@/server/auth.server";
import { isStaffRole } from "@/lib/rbac";
import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUserFromSession();
  if (!user) redirect("/auth");
  if (!isStaffRole(user.role)) redirect("/");

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        role={user.role}
        userEmail={user.email}
        userName={user.full_name}
      />
      <main className="flex-1 overflow-auto bg-muted/20 p-4 md:p-8">{children}</main>
    </div>
  );
}
