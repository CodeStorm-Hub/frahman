import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import {
  Package,
  Users,
  TrendingUp,
  BarChart3,
  BookOpen,
  Clock,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const [
    batches,
    retailerBalances,
    revenueAgg,
    cogsAgg,
    lossAgg,
    recentEntries,
  ] = await Promise.all([
    // Current inventory: sum currentBagsCount × landedCostPerBagPoisha
    prisma.inventoryBatch.findMany({
      select: { currentBagsCount: true, landedCostPerBagPoisha: true },
    }),
    // Outstanding receivables: all retailer balances
    prisma.retailer.aggregate({
      _sum: { currentBalancePoisha: true },
    }),
    // Gross revenue: credits to account 4100 (Wholesale Revenue)
    prisma.ledgerLine.aggregate({
      _sum: { creditPoisha: true },
      where: { account: { code: "4100" } },
    }),
    // COGS: debits to account 5100
    prisma.ledgerLine.aggregate({
      _sum: { debitPoisha: true },
      where: { account: { code: "5100" } },
    }),
    // Inventory losses: debits to account 5200
    prisma.ledgerLine.aggregate({
      _sum: { debitPoisha: true },
      where: { account: { code: "5200" } },
    }),
    // Recent journal entries for activity feed
    prisma.journalEntry.findMany({
      orderBy: { entryDate: "desc" },
      take: 8,
      include: {
        lines: {
          where: { debitPoisha: { gt: 0 } },
          select: { debitPoisha: true },
        },
      },
    }),
  ]);

  // ── KPI calculations ──────────────────────────────────────────────────────
  const inventoryAssetPoisha = batches.reduce(
    (s, b) => s + b.currentBagsCount * b.landedCostPerBagPoisha,
    0,
  );
  const outstandingReceivablesPoisha = retailerBalances._sum.currentBalancePoisha ?? 0;
  const grossRevenuePoisha = revenueAgg._sum.creditPoisha ?? 0;
  const cogsPoisha = cogsAgg._sum.debitPoisha ?? 0;
  const inventoryLossPoisha = lossAgg._sum.debitPoisha ?? 0;
  const netProfitPoisha = grossRevenuePoisha - cogsPoisha - inventoryLossPoisha;
  const netMarginPct =
    grossRevenuePoisha > 0
      ? ((netProfitPoisha / grossRevenuePoisha) * 100).toFixed(1)
      : "0.0";

  const kpis = [
    {
      label: "Inventory Asset",
      value: formatTaka(inventoryAssetPoisha),
      sub: "Current bags × landed cost",
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Outstanding Receivables",
      value: formatTaka(outstandingReceivablesPoisha),
      sub: "Total owed by all dealers",
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Gross Revenue",
      value: formatTaka(grossRevenuePoisha),
      sub: "Cumulative wholesale sales",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Net Profit Margin",
      value: `${netMarginPct}%`,
      sub: formatTaka(netProfitPoisha) + " net profit",
      icon: BarChart3,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live metrics derived from the general ledger
        </p>
      </div>

      {/* KPI grid: 2 cols on mobile, 4 on desktop */}
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
                <p className="text-lg font-bold tabular-nums tracking-tight text-foreground md:text-xl">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent ledger activity */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Ledger Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentEntries.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No transactions recorded yet. Log a procurement intake to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentEntries.map((entry) => {
                const totalDebit = entry.lines.reduce((s, l) => s + l.debitPoisha, 0);
                return (
                  <li key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {entry.referenceNo}
                        </span>
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.entryDate)}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {totalDebit > 0 ? formatTaka(totalDebit) : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
