import { supabase } from "@/integrations/supabase/client";

export type ProductImage = { url: string; alt: string; order: number };
export type ProductSpec = { key: string; value: string };

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
  is_featured: boolean;
  licence_required: boolean;
  power_plant: string | null;
  caliber: string | null;
  velocity: string | null;
  specifications: ProductSpec[];
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
};

const PRODUCT_COLS =
  "id,name,slug,brand,short_description,description,sku,price,compare_at_price,category_slug,sub_category,tags,images,stock,is_featured,licence_required,power_plant,caliber,velocity,specifications";

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function fetchFeaturedProducts(limit = 8): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductRow[];
}

export async function fetchProductCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("products")
    .select("category_slug");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const slug = (row as { category_slug: string | null }).category_slug;
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}
