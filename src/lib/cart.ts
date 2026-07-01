"use server";


export async function fetchCartItems() {
  const { getCartItems } = await import("@/server/store.server");
  return getCartItems();
}

export async function addToCart(input: { productId: string; quantity: number }) {
  const { addProductToCart } = await import("@/server/store.server");
  await addProductToCart(input);
  return { success: true };
}

export async function updateCartItem(input: { itemId: string; quantity: number }) {
  const { changeCartItemQuantity } = await import("@/server/store.server");
  await changeCartItemQuantity(input);
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  const { removeCartItemById } = await import("@/server/store.server");
  await removeCartItemById(itemId);
  return { success: true };
}

export async function checkoutCart() {
  const { checkoutActiveCart } = await import("@/server/store.server");
  return checkoutActiveCart();
}
