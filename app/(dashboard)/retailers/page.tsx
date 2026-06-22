import type { Metadata } from "next";
import { Users, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { AddRetailerDialog } from "@/components/retailers/add-retailer-dialog";
import { RetailerTable } from "@/components/retailers/retailer-table";
import { RetailersCsvExport } from "@/components/retailers/retailers-csv-export";

export const metadata: Metadata = { title: "Retailers — Frahman & Brothers" };

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export default async function RetailersPage() {
  const [retailers, unpaidInvoices] = await Promise.all([
    prisma.retailer.findMany({ orderBy: { shopName: "asc" } }),
    prisma.salesInvoice.findMany({
      where: { isPaid: false },
      select: {
        totalAmountPoisha: true,
        invoiceDate: true,
        retailer: { select: { shopName: true } },
      },
    }),
  ]);

  // Aging buckets (days since invoice date)
  const aging = { current: 0, overdue: 0, serious: 0 };
  const agingPoisha = { current: 0, overdue: 0, serious: 0 };
  for (const inv of unpaidInvoices) {
    const days = daysSince(inv.invoiceDate);
    if (days <= 15) {
      aging.current++;
      agingPoisha.current += inv.totalAmountPoisha;
    } else if (days <= 30) {
      aging.overdue++;
      agingPoisha.overdue += inv.totalAmountPoisha;
    } else {
      aging.serious++;
      agingPoisha.serious += inv.totalAmountPoisha;
    }
  }

  const totalCreditExtended = retailers.reduce((s, r) => s + r.currentBalancePoisha, 0);
  const totalOverLimit = retailers.filter(
    (r) => r.currentBalancePoisha > r.creditLimitPoisha,
  ).length;
  const activeCount = retailers.filter((r) => r.isAuthorized).length;

  const stats = [
    {
      label: "Total Credit Extended",
      value: formatTaka(totalCreditExtended),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Over-Limit Accounts",
      value: totalOverLimit.toString(),
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Authorized Retailers",
      value: activeCount.toString(),
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  const hasAgingData = unpaidInvoices.length > 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Retailers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorized B2B dealer directory &amp; credit accounts
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <RetailersCsvExport retailers={retailers} />
          <AddRetailerDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", s.bg)}>
                  <Icon className={cn("h-4 w-4", s.color)} />
                </div>
                <p className="truncate text-xl font-bold tabular-nums text-foreground md:text-2xl">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Receivables Aging */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Receivables Aging</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!hasAgingData ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              No outstanding invoices — all accounts are settled.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Age Bucket
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                      Invoices
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">
                      Amount Outstanding
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    {
                      label: "Current (0–15 days)",
                      count: aging.current,
                      amount: agingPoisha.current,
                      color: "text-emerald-400",
                    },
                    {
                      label: "Overdue (16–30 days)",
                      count: aging.overdue,
                      amount: agingPoisha.overdue,
                      color: "text-amber-400",
                    },
                    {
                      label: "Seriously Overdue (30+ days)",
                      count: aging.serious,
                      amount: agingPoisha.serious,
                      color: "text-red-400",
                    },
                  ].map((row) => (
                    <tr key={row.label} className={row.count === 0 ? "opacity-40" : ""}>
                      <td className={cn("px-5 py-3 text-sm font-medium", row.color)}>
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {row.count}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">
                        {formatTaka(row.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-muted/10 font-semibold">
                    <td className="px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                      Total Outstanding
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">
                      {unpaidInvoices.length}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">
                      {formatTaka(agingPoisha.current + agingPoisha.overdue + agingPoisha.serious)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retailer table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Credit Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0">
          <RetailerTable retailers={retailers} />
        </CardContent>
      </Card>
    </div>
  );
}
