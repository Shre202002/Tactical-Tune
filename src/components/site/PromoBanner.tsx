import { Copy, Zap } from "lucide-react";
import { useState } from "react";

export function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const code = "TACTICAL10";

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container-tactical">
        <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-sm">
          {/* stripes */}
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: "repeating-linear-gradient(45deg, var(--color-foreground) 0 2px, transparent 2px 24px)",
               }}
          />
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center p-8 md:p-12">
            <div>
              <div className="inline-flex items-center gap-2 text-display text-xs tracking-widest mb-3 bg-foreground/10 px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5" /> LIMITED DROP
              </div>
              <h3 className="text-display text-3xl md:text-5xl leading-tight mb-2">
                10% OFF YOUR FIRST MISSION
              </h3>
              <p className="text-foreground/80 max-w-lg">
                New operator? Lock in your gear with code below. Valid on orders above ₹2,499.
              </p>
            </div>

            <button
              onClick={copy}
              className="group flex items-center gap-3 bg-foreground text-background px-6 py-4 rounded-sm border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <span className="font-mono text-2xl tracking-widest">{code}</span>
              <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {copied && <span className="text-xs text-success ml-2">COPIED!</span>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
