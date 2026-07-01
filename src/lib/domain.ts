export type AppRole = "super_admin" | "admin" | "shop_manager" | "customer";
export type UserStatus = "active" | "inactive" | "blocked" | "pending";
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
  is_primary: boolean;
  order: number;
  fileId?: string | null;
  name?: string | null;
  filePath?: string | null;
  thumbnailUrl?: string | null;
};

export type ProductSpec = {
  key: string;
  value: string;
  commonValue?: string;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductAnalytics = {
  average_rating: number;
  cart_add_count: number;
  review_count: number;
  share_count: number;
  total_orders: number;
  total_views: number;
  wishlist_count: number;
};

export type ProductSeo = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
};

export type ProductShipping = {
  weight_kg: number;
  shape: string;
  package_dimensions_cm: {
    diameter: number | null;
    height: number;
    length: number | null;
    width: number | null;
  };
};

export type ProductReviewImage = {
  url: string;
  alt: string;
};

export type ProductReviewRow = {
  id: string;
  __v: number;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  review_images: ProductReviewImage[];
  status: string;
  is_verified_purchase: boolean;
  likes_count: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  currency: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  category_slug: string | null;
  sub_category: string | null;
  tags: string[];
  images: ProductImage[];
  analytics: ProductAnalytics;
  faqs: ProductFaq[];
  stock: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  is_active: boolean;
  is_deleted: boolean;
  is_featured: boolean;
  licence_required: boolean;
  requiresHandling: boolean;
  requiresPremiumProtection: boolean;
  power_plant: string | null;
  caliber: string | null;
  velocity: string | null;
  specifications: ProductSpec[];
  seo: ProductSeo;
  seo_title: string | null;
  seo_description: string | null;
  shipping: ProductShipping;
  visibility_priority: number;
  created_by_admin: string | null;
  updated_by_admin: string | null;
  createdAt: string;
  updatedAt: string;
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
  emailVerified: boolean;
  firebaseId: string;
  firstName: string;
  lastName: string;
  full_name: string | null;
  phone: string | null;
  phoneVerified: boolean;
  avatar_url: string | null;
  role: AppRole;
  status: UserStatus;
  address: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  created_at: string;
  profile_complete: boolean;
  missing_profile_fields: string[];
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
