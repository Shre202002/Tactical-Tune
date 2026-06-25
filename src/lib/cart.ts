import { supabase } from "@/integrations/supabase/client";

export type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; alt: string; order: number }[];
    stock: number;
  } | null;
};

export async function getOrCreateActiveCart(userId: string): Promise<string> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function fetchCartItems(userId: string): Promise<CartItemRow[]> {
  const cartId = await getOrCreateActiveCart(userId);
  const { data, error } = await supabase
    .from("cart_items")
    .select("id,cart_id,product_id,quantity,unit_price,products(id,name,slug,images,stock)")
    .eq("cart_id", cartId);
  if (error) throw error;
  return (data ?? []) as unknown as CartItemRow[];
}

export async function addToCart(userId: string, productId: string, unitPrice: number, qty = 1) {
  const cartId = await getOrCreateActiveCart(userId);
  // Upsert via select+update or insert
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id,quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + qty })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity: qty, unit_price: unitPrice });
    if (error) throw error;
  }
}

export async function updateCartItem(itemId: string, qty: number) {
  if (qty <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
  }
}

export async function removeCartItem(itemId: string) {
  await supabase.from("cart_items").delete().eq("id", itemId);
}
