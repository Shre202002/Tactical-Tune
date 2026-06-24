import heroImg from "@/assets/hero-airgun.jpg";
import { ArrowRight, Crosshair } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-surface-dark text-surface-dark-foreground overflow-hidden">
      {/* gradient + grid overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />

      <div className="container-tactical relative grid lg:grid-cols-2 gap-10 py-16 md:py-24 lg:py-32 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 border border-primary/40 bg-primary/10 rounded-full">
            <Crosshair className="w-3.5 h-3.5 text-primary" />
            <span className="text-display text-xs text-primary tracking-widest">NEW DROP / SEASON 04</span>
          </div>

          <h1 className="text-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6">
            Precision.
            <br />
            <span className="text-primary">Power.</span>
            <br />
            <span className="relative inline-block">
              Tactical.
              <span className="absolute -right-3 top-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_16px_var(--color-accent)]" />
            </span>
          </h1>

          <p className="text-base md:text-lg text-surface-dark-foreground/70 max-w-md mb-8">
            India's premium tactical sports gear. Built for shooters who refuse to compromise.
            No licence needed. Made in India.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#shop"
              className="btn-tactical-glow group inline-flex items-center gap-2 bg-primary text-primary-foreground text-display px-7 py-3.5 rounded-sm tracking-widest text-sm"
            >
              SHOP NOW
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 border border-surface-dark-foreground/30 text-surface-dark-foreground text-display px-7 py-3.5 rounded-sm tracking-widest text-sm hover:border-accent hover:text-accent transition-colors"
            >
              VIEW CATALOG
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "500K+", v: "Shots Fired" },
              { k: "12K+", v: "Operators" },
              { k: "4.9★", v: "Rated" },
            ].map((s) => (
              <div key={s.v}>
                <div className="text-display text-2xl md:text-3xl text-primary">{s.k}</div>
                <div className="text-xs text-surface-dark-foreground/60 uppercase tracking-wider">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
          <img
            src={heroImg}
            alt="TacticalTune precision airgun rifle with scope"
            width={1536}
            height={1024}
            className="relative w-full h-auto rounded-sm"
          />
          {/* corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
        </div>
      </div>
    </section>
  );
}
