import type { AppRole } from "./domain";

export const STAFF_ROLES = ["super_admin", "admin", "shop_manager"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type AdminPermissions = {
  canAccessAdmin: boolean;
  canManageStaff: boolean;
  canBlockCustomers: boolean;
  canViewCustomers: boolean;
  canManageProducts: boolean;
  canDeleteProducts: boolean;
  canManageCategories: boolean;
  canManagePromos: boolean;
  canViewTransactions: boolean;
  canViewFullTransactions: boolean;
  canUpdateOrders: boolean;
  canViewFullAnalytics: boolean;
  canViewProductAnalytics: boolean;
  canViewAuditLogs: boolean;
  canManageSystemSettings: boolean;
};

export function isStaffRole(role: AppRole): role is StaffRole {
  return role === "super_admin" || role === "admin" || role === "shop_manager";
}

export function getRoleLabel(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "shop_manager":
      return "Shop Manager";
    default:
      return "Customer";
  }
}

export function getAdminPermissions(role: AppRole): AdminPermissions {
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isStaff = isStaffRole(role);

  return {
    canAccessAdmin: isStaff,
    canManageStaff: isSuperAdmin,
    canBlockCustomers: isSuperAdmin || isAdmin,
    canViewCustomers: isStaff,
    canManageProducts: isStaff,
    canDeleteProducts: isSuperAdmin || isAdmin,
    canManageCategories: isSuperAdmin || isAdmin,
    canManagePromos: isSuperAdmin || isAdmin,
    canViewTransactions: isStaff,
    canViewFullTransactions: isSuperAdmin || isAdmin,
    canUpdateOrders: isStaff,
    canViewFullAnalytics: isSuperAdmin || isAdmin,
    canViewProductAnalytics: isStaff,
    canViewAuditLogs: isSuperAdmin,
    canManageSystemSettings: isSuperAdmin,
  };
}

export function getRoleRestrictions(role: AppRole) {
  if (role === "super_admin") return ["Unrestricted system control"];
  if (role === "admin") {
    return [
      "Cannot create or delete staff accounts",
      "Cannot change staff roles",
      "Cannot view raw payment gateway keys",
      "Cannot access system settings or audit logs",
    ];
  }
  if (role === "shop_manager") {
    return [
      "Cannot delete products",
      "Cannot create promo codes or offers",
      "Cannot block or unblock customers",
      "Cannot access staff, payment, system, or audit settings",
    ];
  }
  return ["No admin access"];
}

export const ADMIN_PERMISSION_MATRIX = [
  {
    capability: "Create/manage staff roles",
    super_admin: true,
    admin: false,
    shop_manager: false,
  },
  {
    capability: "Block/unblock customers",
    super_admin: true,
    admin: true,
    shop_manager: false,
  },
  {
    capability: "Add/edit products",
    super_admin: true,
    admin: true,
    shop_manager: true,
  },
  {
    capability: "Delete products",
    super_admin: true,
    admin: true,
    shop_manager: false,
  },
  {
    capability: "Create promo codes",
    super_admin: true,
    admin: true,
    shop_manager: false,
  },
  {
    capability: "Full payment/transaction data",
    super_admin: true,
    admin: true,
    shop_manager: false,
  },
  {
    capability: "Full analytics",
    super_admin: true,
    admin: true,
    shop_manager: false,
  },
  {
    capability: "Admin audit logs",
    super_admin: true,
    admin: false,
    shop_manager: false,
  },
] as const;
