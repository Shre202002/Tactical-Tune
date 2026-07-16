"use server";

export async function fetchMyOrders() {
  const { listCurrentUserOrders } = await import("@/server/store.server");
  return listCurrentUserOrders();
}

export async function fetchOrderById(orderId: string) {
  const { getCurrentUserOrder } = await import("@/server/store.server");
  return getCurrentUserOrder(orderId);
}
