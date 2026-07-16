import type { ProductSpec } from "@/lib/domain";

interface Props {
  specs: ProductSpec[];
  licenceRequired: boolean;
}

export function SpecsTable({ specs, licenceRequired }: Props) {
  const allSpecs: ProductSpec[] = [
    ...specs,
    { key: "Licence Required", value: licenceRequired ? "Yes" : "No" },
  ];

  if (allSpecs.length === 0) return null;

  return (
    <section id="specifications" aria-labelledby="specs-heading">
      <h2
        id="specs-heading"
        className="font-display text-3xl mb-6 border-b border-border pb-3"
      >
        Specifications
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[320px]">
          <tbody>
            {allSpecs.map((spec, idx) => (
              <tr
                key={idx}
                className={`border-b border-border last:border-0 ${
                  idx % 2 === 0 ? "bg-muted/40" : "bg-card"
                }`}
              >
                <td className="w-2/5 py-3.5 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                  {spec.key}
                </td>
                <td className="py-3.5 px-4 text-foreground">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
