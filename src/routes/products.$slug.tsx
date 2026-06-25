import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/catalog";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, Shield, Truck, Crosshair } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

const productOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const p = await fetchProductBySlug(slug);
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(productOptions(params.slug));
  },
  head: ({ loaderData: _ld, params }) => ({
    meta: [
      { title: `${params.slug} — TacticalTune` },
      { name: "description", content: "Tactical airgun product detail." },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-display text-4xl">Product not found</h1>
        <Link to="/" className="text-primary mt-4 inline-block">Go home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-display text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productOptions(slug));
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const images = p.images?.length ? p.images : [{ url: "/placeholder.svg", alt: p.name, order: 0 }];
  const discount = p.compare_at_price && p.compare_at_price > p.price
    ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
    : null;

  async function handleAdd() {
    setAdding(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth";
        return;
      }
      await addToCart(data.user.id, p.id, p.price, qty);
      toast.success(`Added ${qty} × ${p.name} to cart`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />

      <div className="container-tactical py-8">
        <nav className="text-xs text-muted-foreground mb-6 flex gap-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="capitalize">{p.category_slug?.replace(/-/g, " ")}</span>
          <span>/</span>
          <span className="text-foreground">{p.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="bg-card border border-border rounded-lg overflow-hidden aspect-square relative">
              <img
                src={images[activeImg].url}
                alt={images[activeImg].alt}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {discount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{discount}%
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square border rounded overflow-hidden ${
                      i === activeImg ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {p.brand && <p className="text-display text-sm text-primary uppercase tracking-wider">{p.brand}</p>}
            <h1 className="text-display text-3xl md:text-4xl mt-1 mb-3">{p.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-display text-3xl text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
              {p.compare_at_price && p.compare_at_price > p.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{p.compare_at_price.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {p.licence_required ? (
                <Badge variant="destructive">Licence required</Badge>
              ) : (
                <Badge className="bg-success text-success-foreground">No Licence</Badge>
              )}
              {p.stock > 0 ? (
                <Badge variant="outline" className="border-success text-success">
                  In stock ({p.stock})
                </Badge>
              ) : (
                <Badge variant="outline" className="border-destructive text-destructive">
                  Out of stock
                </Badge>
              )}
              {p.tags?.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>

            {p.short_description && (
              <p className="text-muted-foreground mb-6">{p.short_description}</p>
            )}

            {/* Quick specs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {p.power_plant && (
                <div className="bg-card border border-border rounded p-3">
                  <Zap className="w-4 h-4 text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground uppercase">Power</div>
                  <div className="text-sm font-semibold">{p.power_plant}</div>
                </div>
              )}
              {p.caliber && (
                <div className="bg-card border border-border rounded p-3">
                  <Crosshair className="w-4 h-4 text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground uppercase">Caliber</div>
                  <div className="text-sm font-semibold">{p.caliber}</div>
                </div>
              )}
              {p.velocity && (
                <div className="bg-card border border-border rounded p-3">
                  <Zap className="w-4 h-4 text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground uppercase">Velocity</div>
                  <div className="text-sm font-semibold">{p.velocity}</div>
                </div>
              )}
            </div>

            {/* Qty + CTA */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-border rounded">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-accent">−</button>
                <span className="px-4 font-semibold w-10 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-accent">+</button>
              </div>
              <Button onClick={handleAdd} disabled={adding || p.stock === 0} className="flex-1 btn-tactical-glow">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {adding ? "Adding..." : "Add to cart"}
              </Button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> 1-Year warranty</div>
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Free shipping</div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {p.specifications?.length > 0 && (
          <section className="mt-12">
            <h2 className="text-display text-2xl mb-4">Specifications</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {p.specifications.map((s, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-muted-foreground bg-muted/30 w-1/3">{s.key}</td>
                      <td className="px-4 py-3 text-sm">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Description */}
        {p.description && (
          <section className="mt-10">
            <h2 className="text-display text-2xl mb-4">About this product</h2>
            <div className="prose prose-invert max-w-none whitespace-pre-line text-muted-foreground">
              {p.description}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
