import { createServerFn } from "@tanstack/react-start";

export const fetchMyOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { listCurrentUserOrders } = await import("@/server/store.server");
  return listCurrentUserOrders();
});
