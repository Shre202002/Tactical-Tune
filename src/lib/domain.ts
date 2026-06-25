export type AppRole = "super_admin" | "admin" | "customer";
export type CartStatus = "active" | "abandoned" | "converted";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "cancelled"
  | "fulfilled"
  | "refunded";

export type ProductImage = {
  url: string;
  alt: string;
  order: number;
};

export type ProductSpec = {
  key: string;
  value: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  category_slug: string | null;
  sub_category: string | null;
  tags: string[];
  images: ProductImage[];
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  licence_required: boolean;
  power_plant: string | null;
  caliber: string | null;
  velocity: string | null;
  specifications: ProductSpec[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
};

export type CartItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: Pick<ProductRow, "id" | "name" | "slug" | "images" | "stock"> | null;
};

export type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  currency: string;
  promo_code: string | null;
  payment_initiated_at: string | null;
  payment_completed_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRow[];
};

export type PromoRow = {
  id: string;
  code: string;
  description: string | null;
  percent_off: number | null;
  flat_off: number | null;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
