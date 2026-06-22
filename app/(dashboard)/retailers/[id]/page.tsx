import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Receipt, CheckCircle2, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { RecordPaymentDialog } from "@/components/retailers/record-payment-dialog";
import { EditRetailerDialog } from "@/components/retailers/edit-retailer-dialog";

export const metadata: Metadata = { title: "Retailer Account — Frahman & Brothers" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export default async function RetailerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const retailer = await prisma.retailer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { invoiceDate: "desc" },
        include: {
          lines: { include: { product: { select: { name: true } } } },
        },
      },
    },
  });

  if (!retailer) notFound();

  const utilisation =
    retailer.creditLimitPoisha > 0
      ? Math.round((retailer.currentBalancePoisha / retailer.creditLimitPoisha) * 100)
      : 0;
  const isOverLimit = retailer.currentBalancePoisha > retailer.creditLimitPoisha;
  const available = Math.max(0, retailer.creditLimitPoisha - retailer.currentBalancePoisha);

  const unpaidInvoices = retailer.invoices.filter((i) => !i.isPaid);
  const paidInvoices = retailer.invoices.filter((i) => i.isPaid);
  const totalBilled = retailer.invoices.reduce((s, i) => s + i.totalAmountPoisha, 0);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/retailers"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retailers</span>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-foreground">{retailer.shopName}</h1>
          <p className="text-sm text-muted-foreground">{retailer.proprietorName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <EditRetailerDialog
            retailer={{
              id: retailer.id,
              shopName: retailer.shopName,
              proprietorName: retailer.proprietorName,
              phone: retailer.phone,
              address: retailer.address,
              creditLimitPoisha: retailer.creditLimitPoisha,
              isAuthorized: retailer.isAuthorized,
              tradeLicenseNo: retailer.tradeLicenseNo,
              tradeLicenseExpiry: retailer.tradeLicenseExpiry,
              isVerified: retailer.isVerified,
            }}
          />
          {retailer.currentBalancePoisha > 0 && (
            <RecordPaymentDialog
              retailerId={retailer.id}
              shopName={retailer.shopName}
              currentBalancePoisha={retailer.currentBalancePoisha}
              unpaidInvoices={unpaidInvoices.map((i) => ({
                id: i.id,
                invoiceNo: i.invoiceNo,
                totalAmountPoisha: i.totalAmountPoisha,
              }))}
            />
          )}
          <Link
            href={`/retailers/${retailer.id}/statement`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Statement</span>
          </Link>
          <Link
            href={`/sales/new?retailerId=${retailer.id}`}
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <ShoppingCart className="h-4 w-4" />
            New Sale
          </Link>
        </div>
      </div>

      {/* Account summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: "Outstanding Balance", value: formatTaka(retailer.currentBalancePoisha), highlight: retailer.currentBalancePoisha > 0 },
          { label: "Credit Limit", value: formatTaka(retailer.creditLimitPoisha), highlight: false },
          { label: "Available Credit", value: formatTaka(available), highlight: false },
          { label: "Total Billed", value: formatTaka(totalBilled), highlight: false },
        ].map((card) => (
          <Card key={card.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className={cn("text-lg font-bold tabular-nums md:text-xl", card.highlight ? "text-amber-400" : "text-foreground")}>
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit utilisation bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Credit Utilisation</span>
            <span className={cn("font-semibold tabular-nums", isOverLimit ? "text-red-400" : "text-foreground")}>
              {utilisation}%
              {isOverLimit && " — Over Limit"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/40">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOverLimit ? "bg-red-500" : utilisation > 75 ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(utilisation, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{retailer.phone}</span>
            <span>{retailer.address}</span>
            <span className={cn("font-medium", retailer.isAuthorized ? "text-emerald-400" : "text-red-400")}>
              {retailer.isAuthorized ? "Authorized" : "Suspended"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding invoices */}
      {unpaidInvoices.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold">
                Outstanding Invoices ({unpaidInvoices.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Invoice</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Items</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Age</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unpaidInvoices.map((inv) => {
                    const days = daysSince(inv.invoiceDate);
                    const ageColor =
                      days > 30 ? "text-red-400" : days > 15 ? "text-amber-400" : "text-muted-foreground";
                    return (
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3 font-mono text-xs font-medium text-foreground">
                          <Link href={`/sales/${inv.id}`} className="hover:underline">
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {inv.lines.map((l) => `${l.bagsCount} ${l.product.name}`).join(", ")}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-foreground">
                          {formatTaka(inv.totalAmountPoisha)}
                        </td>
                        <td className={cn("px-3 py-3 text-right tabular-nums text-xs font-medium", ageColor)}>
                          {days}d
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {formatDate(inv.invoiceDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice history */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              All Invoices ({retailer.invoices.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {retailer.invoices.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">No invoices yet for this retailer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Invoice</th>
                    <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell">Items</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="hidden px-5 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {retailer.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-foreground">
                        <Link href={`/sales/${inv.id}`} className="hover:underline">
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-muted-foreground sm:table-cell">
                        {inv.lines.map((l) => `${l.bagsCount} ${l.product.name}`).join(", ")}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-foreground">
                        {formatTaka(inv.totalAmountPoisha)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          inv.isPaid
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/25 bg-amber-500/10 text-amber-400",
                        )}>
                          {inv.isPaid ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                          {inv.isPaid ? "Settled" : "Outstanding"}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-xs text-muted-foreground md:table-cell">
                        {formatDate(inv.invoiceDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/10">
                    <td colSpan={2} className="px-5 py-2.5 text-xs text-muted-foreground">
                      {paidInvoices.length} settled · {unpaidInvoices.length} outstanding
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs font-bold text-foreground">
                      {formatTaka(totalBilled)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
