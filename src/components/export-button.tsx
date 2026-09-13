import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBookExcel, downloadHoldingsExcel } from "@/lib/kosh/export";
import type { Book, Holding, Portfolio } from "@/lib/kosh/types";

export function ExportButton({
  name,
  book,
  portfolio,
  holdings,
}: {
  name: string;
  book?: Book | null;
  portfolio?: Portfolio;
  holdings?: Holding[];
}) {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        try {
          if (book) downloadBookExcel(name, book, portfolio);
          else downloadHoldingsExcel(name, holdings || portfolio?.holdings || []);
          toast.success("Excel downloaded");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not export");
        }
      }}
    >
      <Download className="size-3.5" />
      Excel
    </Button>
  );
}
