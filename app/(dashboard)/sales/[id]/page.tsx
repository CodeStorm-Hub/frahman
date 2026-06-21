import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { PrintButton } from "@/components/sales/print-button";

export const metadata: Metadata = { title: "Invoice — Frahman & Brothers" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.salesInvoice.findUnique({
    where: { id },
    include: {
      retailer: true,
      lines: {
        include: { product: { select: { name: true, chemicalSpec: true } } },
      },
    },
  });

  if (!invoice) notFound();

  const totalBags = invoice.lines.reduce((s, l) => s + l.bagsCount, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Toolbar — hidden when printing */}
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/sales"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Invoices</span>
        </Link>
        <div className="flex-1" />
        <PrintButton />
      </div>

      {/* Invoice document */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm print:rounded-none print:border-none print:shadow-none md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Frahman &amp; Brothers</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fertilizer Distributor, Pirojpur, Bangladesh
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-foreground">{invoice.invoiceNo}</p>
            <p className="text-sm text-muted-foreground">{formatDate(invoice.invoiceDate)}</p>
            <span
              className={cn(
                "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                invoice.isPaid
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-400",
              )}
            >
              {invoice.isPaid ? "Settled" : "Outstanding"}
            </span>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-8 rounded-lg border border-border/60 bg-muted/20 px-5 py-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Bill To
          </p>
          <p className="font-semibold text-foreground">{invoice.retailer.shopName}</p>
          <p className="text-sm text-muted-foreground">{invoice.retailer.proprietorName}</p>
          {invoice.retailer.phone && (
            <p className="text-sm text-muted-foreground">{invoice.retailer.phone}</p>
          )}
          {invoice.retailer.address && (
            <p className="text-sm text-muted-foreground">{invoice.retailer.address}</p>
          )}
        </div>

        {/* Line items */}
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bags (50 kg)
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rate / Bag
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {invoice.lines.map((line) => (
              <tr key={line.id}>
                <td className="py-3">
                  <p className="font-medium text-foreground">{line.product.name}</p>
                  <p className="text-xs text-muted-foreground">{line.product.chemicalSpec}</p>
                </td>
                <td className="py-3 text-right tabular-nums text-foreground">{line.bagsCount}</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">
                  {formatTaka(line.pricePerBagPoisha)}
                </td>
                <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                  {formatTaka(line.pricePerBagPoisha * line.bagsCount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td className="pt-3 text-xs text-muted-foreground">
                {totalBags} bag{totalBags !== 1 ? "s" : ""} total
              </td>
              <td />
              <td className="pt-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </td>
              <td className="pt-3 text-right tabular-nums text-xl font-bold text-foreground">
                {formatTaka(invoice.totalAmountPoisha)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="mt-8 border-t border-border/40 pt-6 text-xs text-muted-foreground">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Payment Terms</p>
              <p>Due on demand. Government-regulated fertilizer sale.</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">Authorized Signature</p>
              <div className="mt-6 border-t border-muted-foreground/30 pt-1 text-center">
                Frahman &amp; Brothers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
