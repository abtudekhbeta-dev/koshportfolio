import { createFileRoute } from "@tanstack/react-router";
import { useBookCtx } from "@/components/book-context";
import { SeasonalityDesk } from "@/components/seasonality-desk";

export const Route = createFileRoute("/p/$id/seasonality")({ component: SeasonalityPage });

function SeasonalityPage() {
  const { query } = useBookCtx();
  const book = query.data!;
  const rows = book.rows.filter((r) => book.includeCommodities || r.kind !== "commodity");
  return (
    <div className="kosh-page grid gap-8">
      <SeasonalityDesk
        mode="portfolio"
        names={rows.map((r) => ({ symbol: r.symbol, name: r.name, weight: r.weight * 100 }))}
      />
    </div>
  );
}
