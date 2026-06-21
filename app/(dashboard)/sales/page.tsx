import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Plus, Users, TrendingUp, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";

export const metadata: Metadata = { title: "Invoices — Frahman & Brothers" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function SalesHistoryPage() {
  const [invoices, stats] = await Promise.all([
    prisma.salesInvoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        retailer: { select: { shopName: true, proprietorName: true } },
        lines: {
          include: { product: { select: { name: true } } },
        },
      },
    }),
    prisma.salesInvoice.aggregate({
      _sum: { totalAmountPoisha: true },
      _count: { id: true },
    }),
  ]);

  const totalRevenue = stats._sum.totalAmountPoisha ?? 0;
  const totalInvoices = stats._count.id;
  const paidCount = invoices.filter((i) => i.isPaid).length;

  const kpis = [
    {
      label: "Total Invoices",
      value: totalInvoices.toString(),
      icon: Receipt,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Billed",
      value: formatTaka(totalRevenue),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Settled",
      value: paidCount.toString(),
      icon: FileCheck,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Outstanding",
      value: (totalInvoices - paidCount).toString(),
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete history of all credit sales
          </p>
        </div>
        <Link
          href="/sales/new"
          className={cn(buttonVariants({ size: "sm" }), "ml-auto gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          New Sale
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div
                  className={cn(
                    "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                    kpi.bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", kpi.color)} />
                </div>
                <p className="text-lg font-bold tabular-nums text-foreground md:text-xl">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoice table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No invoices yet.{" "}
              <Link href="/sales/new" className="text-foreground underline underline-offset-2">
                Create your first sale.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Invoice No.
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Retailer
                    </th>
                    <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                      Items
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => {
                    const itemsSummary = inv.lines
                      .map((l) => `${l.bagsCount} ${l.product.name}`)
                      .join(", ");
                    return (
                      <tr key={inv.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">
                          <Link href={`/sales/${inv.id}`} className="hover:underline underline-offset-2">
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-medium text-foreground">
                            {inv.retailer.shopName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inv.retailer.proprietorName}
                          </p>
                        </td>
                        <td className="hidden px-3 py-3.5 text-xs text-muted-foreground sm:table-cell">
                          <span className="line-clamp-1 max-w-[200px]">{itemsSummary}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right tabular-nums font-semibold text-foreground">
                          {formatTaka(inv.totalAmountPoisha)}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              inv.isPaid
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-400",
                            )}
                          >
                            {inv.isPaid ? "Settled" : "Outstanding"}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 text-xs text-muted-foreground md:table-cell">
                          {formatDate(inv.invoiceDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
