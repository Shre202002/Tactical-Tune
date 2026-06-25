import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";

import type {
  CartItemRow,
  CartStatus,
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from "@/lib/domain";
import { requireUser } from "./auth.server";
import { getCollection, getMongoClient } from "./database.server";
import {
  type ProductDocument,
  serializeProduct,
} from "./catalog.server";

type CartItemDocument = {
  _id: ObjectId;
  product_id: ObjectId;
  quantity: number;
  unit_price: number;
};

export type CartDocument = {
  _id: ObjectId;
  user_id: ObjectId;
  status: CartStatus;
  items: CartItemDocument[];
  created_at: Date;
  updated_at: Date;
};

type OrderItemDocument = Omit<OrderItemRow, "product_id"> & {
  product_id: ObjectId | null;
};

export type OrderDocument = {
  _id: ObjectId;
  order_number: string;
  user_id: ObjectId;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  currency: string;
  promo_code: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  payment_initiated_at: Date | null;
  payment_completed_at: Date | null;
  notes: string | null;
  order_items: OrderItemDocument[];
  created_at: Date;
  updated_at: Date;
};

function serializeOrder(order: OrderDocument): OrderRow {
  return {
    id: order._id.toHexString(),
    order_number: order.order_number,
    user_id: order.user_id.toHexString(),
    status: order.status,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping_fee: Number(order.shipping_fee),
    tax: Number(order.tax),
    total: Number(order.total),
    currency: order.currency,
    promo_code: order.promo_code,
    payment_initiated_at: order.payment_initiated_at?.toISOString() ?? null,
    payment_completed_at: order.payment_completed_at?.toISOString() ?? null,
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
    order_items: order.order_items.map((item) => ({
      ...item,
      product_id: item.product_id?.toHexString() ?? null,
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    })),
  };
}

async function getOrCreateCart(userId: ObjectId) {
  const carts = await getCollection<CartDocument>("carts");
  const existing = await carts.findOne({ user_id: userId, status: "active" });
  if (existing) return existing;

  const now = new Date();
  const cart: CartDocument = {
    _id: new ObjectId(),
    user_id: userId,
    status: "active",
    items: [],
    created_at: now,
    updated_at: now,
  };

  try {
    await carts.insertOne(cart);
    return cart;
  } catch (error) {
    const raced = await carts.findOne({ user_id: userId, status: "active" });
    if (raced) return raced;
    throw error;
  }
}

export async function getCartItems(): Promise<CartItemRow[]> {
  const user = await requireUser();
  const cart = await getOrCreateCart(new ObjectId(user.id));
  if (cart.items.length === 0) return [];

  const productIds = cart.items.map((item) => item.product_id);
  const products = await getCollection<ProductDocument>("products");
  const productRows = await products.find({ _id: { $in: productIds } }).toArray();
  const productMap = new Map(
    productRows.map((product) => [product._id.toHexString(), serializeProduct(product)]),
  );

  return cart.items.map((item) => {
    const product = productMap.get(item.product_id.toHexString());
    return {
      id: item._id.toHexString(),
      product_id: item.product_id.toHexString(),
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      products: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            images: product.images,
            stock: product.stock,
          }
        : null,
    };
  });
}

export async function addProductToCart(input: { productId: string; quantity: number }) {
  const user = await requireUser();
  if (!ObjectId.isValid(input.productId)) throw new Error("Invalid product.");

  const quantity = Math.max(1, Math.min(Math.floor(input.quantity), 20));
  const products = await getCollection<ProductDocument>("products");
  const product = await products.findOne({
    _id: new ObjectId(input.productId),
    is_active: true,
  });
  if (!product) throw new Error("Product not found.");
  if (product.stock < quantity) throw new Error("Requested quantity is not available.");

  const cart = await getOrCreateCart(new ObjectId(user.id));
  const carts = await getCollection<CartDocument>("carts");
  const existing = cart.items.find((item) => item.product_id.equals(product._id));
  const now = new Date();

  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    if (nextQuantity > product.stock) throw new Error("Requested quantity is not available.");
    await carts.updateOne(
      { _id: cart._id, "items._id": existing._id },
      {
        $set: {
          "items.$.quantity": nextQuantity,
          "items.$.unit_price": Number(product.price),
          updated_at: now,
        },
      },
    );
  } else {
    await carts.updateOne(
      { _id: cart._id },
      {
        $push: {
          items: {
            _id: new ObjectId(),
            product_id: product._id,
            quantity,
            unit_price: Number(product.price),
          },
        },
        $set: { updated_at: now },
      },
    );
  }
}

export async function changeCartItemQuantity(input: { itemId: string; quantity: number }) {
  const user = await requireUser();
  if (!ObjectId.isValid(input.itemId)) throw new Error("Invalid cart item.");

  const carts = await getCollection<CartDocument>("carts");
  const cart = await carts.findOne({
    user_id: new ObjectId(user.id),
    status: "active",
    "items._id": new ObjectId(input.itemId),
  });
  if (!cart) throw new Error("Cart item not found.");

  if (input.quantity <= 0) {
    await removeCartItemById(input.itemId);
    return;
  }

  const item = cart.items.find((row) => row._id.equals(new ObjectId(input.itemId)));
  if (!item) throw new Error("Cart item not found.");
  const products = await getCollection<ProductDocument>("products");
  const product = await products.findOne({ _id: item.product_id, is_active: true });
  if (!product || product.stock < input.quantity) {
    throw new Error("Requested quantity is not available.");
  }

  await carts.updateOne(
    { _id: cart._id, "items._id": item._id },
    {
      $set: {
        "items.$.quantity": Math.floor(input.quantity),
        "items.$.unit_price": Number(product.price),
        updated_at: new Date(),
      },
    },
  );
}

export async function removeCartItemById(itemId: string) {
  const user = await requireUser();
  if (!ObjectId.isValid(itemId)) throw new Error("Invalid cart item.");
  const carts = await getCollection<CartDocument>("carts");
  await carts.updateOne(
    { user_id: new ObjectId(user.id), status: "active" },
    {
      $pull: { items: { _id: new ObjectId(itemId) } },
      $set: { updated_at: new Date() },
    },
  );
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TT-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function checkoutActiveCart() {
  const user = await requireUser();
  const userId = new ObjectId(user.id);
  const client = await getMongoClient();
  const session = client.startSession();
  let createdOrderId = "";

  try {
    await session.withTransaction(async () => {
      const carts = await getCollection<CartDocument>("carts");
      const products = await getCollection<ProductDocument>("products");
      const orders = await getCollection<OrderDocument>("orders");

      const cart = await carts.findOne(
        { user_id: userId, status: "active" },
        { session },
      );
      if (!cart || cart.items.length === 0) throw new Error("Your cart is empty.");

      const productRows = await products
        .find(
          {
            _id: { $in: cart.items.map((item) => item.product_id) },
            is_active: true,
          },
          { session },
        )
        .toArray();
      const productMap = new Map(
        productRows.map((product) => [product._id.toHexString(), product]),
      );

      const orderItems: OrderItemDocument[] = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = productMap.get(cartItem.product_id.toHexString());
        if (!product) throw new Error("One of the products is no longer available.");
        if (cartItem.quantity > product.stock) {
          throw new Error(`${product.name} does not have enough stock.`);
        }

        const unitPrice = Number(product.price);
        const lineTotal = unitPrice * cartItem.quantity;
        subtotal += lineTotal;
        orderItems.push({
          product_id: product._id,
          product_name: product.name,
          product_slug: product.slug,
          product_image: product.images?.[0]?.url ?? null,
          unit_price: unitPrice,
          quantity: cartItem.quantity,
          line_total: lineTotal,
        });
      }

      for (const item of orderItems) {
        if (!item.product_id) continue;
        const update = await products.updateOne(
          {
            _id: item.product_id,
            is_active: true,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity }, $set: { updated_at: new Date() } },
          { session },
        );
        if (update.modifiedCount !== 1) {
          throw new Error(`${item.product_name} stock changed. Please try again.`);
        }
      }

      const now = new Date();
      const order: OrderDocument = {
        _id: new ObjectId(),
        order_number: createOrderNumber(),
        user_id: userId,
        status: "pending_payment",
        subtotal,
        discount: 0,
        shipping_fee: 0,
        tax: 0,
        total: subtotal,
        currency: "INR",
        promo_code: null,
        shipping_address: null,
        billing_address: null,
        payment_initiated_at: now,
        payment_completed_at: null,
        notes: null,
        order_items: orderItems,
        created_at: now,
        updated_at: now,
      };

      await orders.insertOne(order, { session });
      await carts.updateOne(
        { _id: cart._id, status: "active" },
        { $set: { status: "converted", updated_at: now } },
        { session },
      );
      createdOrderId = order._id.toHexString();
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrderId) throw new Error("Could not create order.");
  return { orderId: createdOrderId };
}

export async function listCurrentUserOrders() {
  const user = await requireUser();
  const orders = await getCollection<OrderDocument>("orders");
  const rows = await orders
    .find({ user_id: new ObjectId(user.id) })
    .sort({ created_at: -1 })
    .toArray();
  return rows.map(serializeOrder);
}

export { serializeOrder };
