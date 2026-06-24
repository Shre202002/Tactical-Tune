import { ShieldCheck, Truck, Award, MapPin } from "lucide-react";

const trust = [
  { icon: ShieldCheck, title: "No Licence Needed", sub: "Legal under .177 cal" },
  { icon: MapPin, title: "Made in India", sub: "Engineered in Kanpur" },
  { icon: Truck, title: "Free Pan-India Delivery", sub: "On orders over ₹2,499" },
  { icon: Award, title: "1-Year Warranty", sub: "Full manufacturer cover" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="container-tactical grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
        {trust.map((t) => (
          <div key={t.title} className="flex items-center gap-3">
            <div className="shrink-0 w-11 h-11 rounded-sm bg-primary/10 flex items-center justify-center">
              <t.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-display text-sm md:text-base leading-tight">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
