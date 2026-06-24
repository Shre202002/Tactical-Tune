const items = [
  "FREE DELIVERY PAN-INDIA",
  "USE CODE TACTICAL10 FOR 10% OFF",
  "NO LICENCE NEEDED",
  "100% MADE IN INDIA",
  "1-YEAR WARRANTY",
];

export function AnnouncementBar() {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="bg-secondary text-secondary-foreground overflow-hidden border-b border-secondary/50">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {loop.map((t, i) => (
          <span key={i} className="text-display text-xs tracking-widest mx-8 inline-flex items-center gap-3">
            <span className="text-primary">◆</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
