import Link from "next/link";

/**
 * "When should I wear this?" — the four-fragrance comparison the redesign
 * blueprint asks for. Static content tied to the four fixed signatures; the
 * ratings are a suggested UX format, not measurements.
 */
const COLUMNS: Array<{ name: string; slug: string }> = [
  { name: "Cold War", slug: "coldwar" },
  { name: "Heavenly", slug: "heavenly" },
  { name: "Old Love", slug: "old-love" },
  { name: "Billionaire", slug: "billionaire" },
];

const ROWS: Array<{ use: string; ratings: [number, number, number, number] }> =
  [
    { use: "Day", ratings: [5, 4, 3, 3] },
    { use: "Office", ratings: [5, 4, 3, 3] },
    { use: "Date", ratings: [3, 5, 5, 4] },
    { use: "Night out", ratings: [3, 4, 5, 5] },
  ];

const stars = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

export default function WearGuide() {
  return (
    <section className="wear-guide" id="when-to-wear">
      <div className="wear-guide-head">
        <p className="eyebrow">The wardrobe</p>
        <h2 className="display-title">When should you wear each one?</h2>
        <p>
          Where each signature performs best. Suggested pairings that reflect
          the brand&rsquo;s positioning, not a rule.
        </p>
      </div>
      <div className="wear-guide-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Occasion</th>
              {COLUMNS.map((column) => (
                <th scope="col" key={column.slug}>
                  <Link href={`/products/${column.slug}`}>{column.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.use}>
                <th scope="row">{row.use}</th>
                {row.ratings.map((rating, index) => (
                  <td key={COLUMNS[index].slug}>
                    <span aria-label={`${rating} out of 5`}>
                      {stars(rating)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
