import { CheckCircle2 } from "lucide-react";

const BOX_ITEMS = [
  "Main Unit",
  "User Manual (English)",
  "Warranty Card",
  "Standard Accessories",
  "Cleaning Rod",
  "Pellet Sample Pack",
];

export function WhatsInBox() {
  return (
    <section id="whats-in-the-box" aria-labelledby="box-heading">
      <h2
        id="box-heading"
        className="font-display text-3xl mb-6 border-b border-border pb-3"
      >
        📦 What's in the Box
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BOX_ITEMS.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
