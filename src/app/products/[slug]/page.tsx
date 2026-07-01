import { fetchProductBySlug } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { ProductClient } from "./ProductClient";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const p = await fetchProductBySlug(params.slug);

  if (!p) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${p.name} — TacticalTune`,
    description: p.short_description || p.description?.slice(0, 150),
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const p = await fetchProductBySlug(params.slug);

  if (!p) {
    notFound();
  }

  return <ProductClient p={p} />;
}
