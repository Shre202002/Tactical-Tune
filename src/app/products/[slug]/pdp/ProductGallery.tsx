"use client";

import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/lib/domain";

interface Props {
  images: ProductImage[];
  productName: string;
  isFeatured?: boolean;
}

export function ProductGallery({ images, productName, isFeatured }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [hoverSupported, setHoverSupported] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const activeImage = images[Math.min(activeIdx, images.length - 1)] ?? images[0];

  // Only enable zoom on true hover-capable (non-touch) devices
  useEffect(() => {
    setHoverSupported(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const scrollThumbs = (dir: "left" | "right") => {
    thumbsRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const canZoom = hoverSupported;

  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative">
        {isFeatured && (
          <span className="absolute top-3 left-3 z-10 bg-[#e02020] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow-sm pointer-events-none">
            Featured
          </span>
        )}

        <div
          className={`relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden border border-border bg-card ${canZoom ? "cursor-zoom-in" : ""}`}
          onMouseEnter={() => canZoom && setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={activeImage.url}
            alt={activeImage.alt || productName}
            className="w-full h-full object-contain select-none"
            style={{
              transition: isZooming ? "transform 0.08s ease-out" : "transform 0.25s ease-out",
              transform: isZooming ? "scale(2.5)" : "scale(1)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
            draggable={false}
          />
        </div>

        {/* Zoom hint — desktop only */}
        {canZoom && (
          <p className="hidden md:flex items-center gap-1.5 mt-2 text-xs text-muted-foreground justify-center">
            <ZoomIn className="w-3.5 h-3.5" />
            Hover to zoom
          </p>
        )}
      </div>

      {/* Thumbnail Row */}
      {images.length > 1 && (
        <div className="relative group/thumbs">
          {/* Left chevron — desktop only */}
          <button
            onClick={() => scrollThumbs("left")}
            aria-label="Scroll thumbnails left"
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow items-center justify-center opacity-0 group-hover/thumbs:opacity-100 transition-opacity hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1"
            style={{
              scrollbarWidth: "none",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-pressed={idx === activeIdx}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all focus-visible:outline-2 focus-visible:outline-primary ${
                  idx === activeIdx
                    ? "border-primary opacity-100 ring-1 ring-primary/50"
                    : "border-border opacity-55 hover:opacity-90 hover:border-muted-foreground"
                }`}
                style={{ scrollSnapAlign: "start" }}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={img.alt || `${productName} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Right chevron — desktop only */}
          <button
            onClick={() => scrollThumbs("right")}
            aria-label="Scroll thumbnails right"
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow items-center justify-center opacity-0 group-hover/thumbs:opacity-100 transition-opacity hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
