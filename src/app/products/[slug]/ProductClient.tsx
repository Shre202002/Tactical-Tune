"use client";

import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import type { ProductRow, ProductImage } from "@/lib/domain";

// PDP Sub-components
import { ProductGallery } from "./pdp/ProductGallery";
import { BuyBox } from "./pdp/BuyBox";
import { SpecsTable } from "./pdp/SpecsTable";
import { WhatsInBox } from "./pdp/WhatsInBox";
import { ReviewsSection } from "./pdp/ReviewsSection";
import { RelatedProducts } from "./pdp/RelatedProducts";

function normalizeImages(product: ProductRow): ProductImage[] {
  if (product.images?.length) return product.images;
  return [{ url: "/placeholder.svg", alt: product.name, is_primary: true, order: 0 }];
}

export function ProductClient({ p }: { p: ProductRow }) {
  const { data: user = null } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    retry: false,
  });

  const images = normalizeImages(p);
  const averageRating = p.analytics?.average_rating || 0;
  const reviewCount = p.analytics?.review_count || 0;

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in the ${p.name}. Can you help me?`
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-tactical py-8">

        {/* ── Two-column hero layout ── */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 mb-20">

          {/* Left — sticky image gallery */}
          <ProductGallery
            images={images}
            productName={p.name}
            isFeatured={p.is_featured}
          />

          {/* Right — buy box (scrolls freely) */}
          <BuyBox p={p} user={user} />
        </div>

        {/* ── Full-width bottom sections ── */}
        <div className="space-y-16">

          {/* Specs */}
          {(p.specifications?.length > 0 || true) && (
            <SpecsTable specs={p.specifications || []} licenceRequired={p.licence_required} />
          )}

          {/* What's in the box */}
          <WhatsInBox />

          {/* Reviews */}
          <ReviewsSection
            p={p}
            user={user}
            initialAverageRating={averageRating}
            initialReviewCount={reviewCount}
          />

          {/* Related products */}
          <RelatedProducts
            currentProductId={p.id}
            categorySlug={p.category_slug}
          />
        </div>
      </div>

      {/* ── Floating WhatsApp button ── */}
      <a
        href={`https://wa.me/910000000000?text=${waMessage}`}
        target="_blank"
        rel="noreferrer"
        id="floating-whatsapp-btn"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all font-bold text-sm"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Chat</span>
      </a>
    </div>
  );
}
