"use server";

export async function fetchMyOrders() {
  const { listCurrentUserOrders } = await import("@/server/store.server");
  return listCurrentUserOrders();
}
