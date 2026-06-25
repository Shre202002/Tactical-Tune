import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type { CartItemRow } from "./domain";

export const fetchCartItems = createServerFn({ method: "GET" }).handler(async () => {
  const { getCartItems } = await import("@/server/store.server");
  return getCartItems();
});

export const addToCart = createServerFn({ method: "POST" })
  .validator(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const { addProductToCart } = await import("@/server/store.server");
    await addProductToCart(data);
    return { success: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .validator(
    z.object({
      itemId: z.string().min(1),
      quantity: z.number().int(),
    }),
  )
  .handler(async ({ data }) => {
    const { changeCartItemQuantity } = await import("@/server/store.server");
    await changeCartItemQuantity(data);
    return { success: true };
  });

export const removeCartItem = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { removeCartItemById } = await import("@/server/store.server");
    await removeCartItemById(data.itemId);
    return { success: true };
  });

export const checkoutCart = createServerFn({ method: "POST" }).handler(async () => {
  const { checkoutActiveCart } = await import("@/server/store.server");
  return checkoutActiveCart();
});
