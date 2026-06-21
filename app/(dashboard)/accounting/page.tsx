import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  Users,
  AlertCircle,
  Banknote,
} from "lucide-react";

export const metadata: Metadata = { title: "P&L Overview — Frahman & Brothers" };

async function getAccountBalance(code: string) {
  const result = await prisma.ledgerLine.aggregate({
    _sum: { debitPoisha: true, creditPoisha: true },
    where: { account: { code } },
  });
  return {
    debits: result._sum.debitPoisha ?? 0,
    credits: result._sum.creditPoisha ?? 0,
  };
}

export default async function AccountingPage() {
  const [rev, cogs, loss, cash, inventory, ar, ap] = await Promise.all([
    getAccountBalance("4100"), // Revenue — credits are earnings
    getAccountBalance("5100"), // COGS — debits are costs
    getAccountBalance("5200"), // Inventory Loss — debits are losses
    getAccountBalance("1100"), // Cash & Bank — debits = inflows, credits = outflows
    getAccountBalance("1200"), // Inventory Asset
    getAccountBalance("1300"), // Accounts Receivable
    getAccountBalance("2100"), // Accounts Payable
  ]);

  // P&L
  const grossRevenue = rev.credits;
  const cogsTotal = cogs.debits;
  const grossProfit = grossRevenue - cogsTotal;
  const inventoryLoss = loss.debits;
  const operatingProfit = grossProfit - inventoryLoss;
  const grossMarginPct = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : "0.0";
  const netMarginPct =
    grossRevenue > 0 ? ((operatingProfit / grossRevenue) * 100).toFixed(1) : "0.0";

  // Balance Sheet positions
  const cashBalance = cash.debits - cash.credits;
  const inventoryValue = inventory.debits - inventory.credits;
  const arBalance = ar.debits - ar.credits;
  const apBalance = ap.credits - ap.debits;
  const totalAssets = cashBalance + inventoryValue + arBalance;
  const netEquity = totalAssets - apBalance;

  const plRows = [
    { label: "Gross Revenue", value: grossRevenue, type: "income" },
    { label: "Cost of Goods Sold", value: -cogsTotal, type: "expense" },
    { label: "Gross Profit", value: grossProfit, type: grossProfit >= 0 ? "profit" : "loss", bold: true },
    { label: "Inventory Write-offs", value: -inventoryLoss, type: "expense" },
    { label: "Operating Profit", value: operatingProfit, type: operatingProfit >= 0 ? "profit" : "loss", bold: true },
  ];

  const balanceRows = [
    { label: "Cash & Bank", value: cashBalance, icon: Banknote, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Inventory on Hand", value: inventoryValue, icon: Package, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Accounts Receivable", value: arBalance, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Accounts Payable (owed)", value: apBalance, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">P&amp;L Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profit &amp; loss and balance sheet derived from the general ledger
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: "Gross Revenue", value: formatTaka(grossRevenue), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Gross Profit", value: formatTaka(grossProfit), icon: Wallet, color: grossProfit >= 0 ? "text-emerald-400" : "text-red-400", bg: grossProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
          { label: "Net Equity", value: formatTaka(netEquity), icon: Wallet, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Net Margin", value: `${netMarginPct}%`, icon: TrendingDown, color: parseFloat(netMarginPct) >= 0 ? "text-emerald-400" : "text-red-400", bg: parseFloat(netMarginPct) >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", kpi.bg)}>
                  <Icon className={cn("h-4 w-4", kpi.color)} />
                </div>
                <p className="text-lg font-bold tabular-nums text-foreground md:text-xl">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* P&L Statement */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Profit &amp; Loss
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                Gross {grossMarginPct}% · Net {netMarginPct}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/50">
                {plRows.map((row) => (
                  <tr key={row.label} className={row.bold ? "bg-muted/10" : ""}>
                    <td className={cn("px-5 py-3", row.bold && "font-semibold text-foreground", !row.bold && "text-muted-foreground")}>
                      {row.label}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right tabular-nums",
                        row.bold && "font-bold",
                        row.type === "income" && "text-emerald-400",
                        row.type === "expense" && "text-red-400",
                        row.type === "profit" && "text-emerald-400",
                        row.type === "loss" && "text-red-400",
                        !["income","expense","profit","loss"].includes(row.type) && "text-foreground",
                      )}
                    >
                      {row.value < 0
                        ? `(${formatTaka(Math.abs(row.value))})`
                        : formatTaka(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Balance Sheet Positions */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Balance Sheet
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                Net equity {formatTaka(netEquity)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {balanceRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", row.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", row.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {formatTaka(row.value)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Net Equity
              </span>
              <span className={cn("tabular-nums font-bold", netEquity >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatTaka(netEquity)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
