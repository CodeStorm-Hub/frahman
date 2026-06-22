import Link from "next/link";
import { Receipt } from "lucide-react";

export default function InvoiceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
        <Receipt className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">Invoice not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This invoice does not exist or has been removed.
        </p>
      </div>
      <Link
        href="/sales"
        className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
      >
        Back to Invoices
      </Link>
    </div>
  );
}
