import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Target, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — TacticalTune",
  description: "Learn more about TacticalTune, your premier destination for tactical sports gear.",
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-card border-b border-border py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/grid-pattern.svg')]"></div>
        <div className="container-tactical relative z-10 text-center">
          <h1 className="text-display text-5xl md:text-6xl text-primary mb-6">Built for Precision</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl">
            At TacticalTune, we supply professional-grade tactical sports gear to competitors, enthusiasts, and operators across the nation. We believe in equipment that never fails when the pressure is on.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24">
        <div className="container-tactical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-sm border border-border text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-primary mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-display text-2xl mb-3">Uncompromising Accuracy</h3>
              <p className="text-muted-foreground">
                Every air rifle, pistol, and optic we stock is vetted for strict tolerances and reliable zero. We only sell what we'd bring to the range ourselves.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-sm border border-border text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-primary mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-display text-2xl mb-3">Durability & Trust</h3>
              <p className="text-muted-foreground">
                Tactical environments demand rugged gear. Our catalog features products tested in harsh conditions to ensure they withstand the test of time.
              </p>
            </div>

            <div className="bg-card p-8 rounded-sm border border-border text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-primary mb-6">
                <Award size={32} />
              </div>
              <h3 className="text-display text-2xl mb-3">Expert Service</h3>
              <p className="text-muted-foreground">
                Our team consists of active shooters and tactical experts ready to advise you on the best loadout for your specific operational or sporting needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t border-border py-16 text-center">
        <div className="container-tactical">
          <h2 className="text-display text-3xl mb-4 text-foreground">Ready to upgrade your arsenal?</h2>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/shop" className="btn-tactical-glow bg-primary text-primary-foreground px-8 py-3 rounded-sm font-semibold uppercase tracking-wider">
              Browse Gear
            </Link>
            <Link href="/contact" className="bg-secondary text-secondary-foreground px-8 py-3 rounded-sm font-semibold uppercase tracking-wider hover:bg-secondary/80 transition-colors border border-border">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
