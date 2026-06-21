import type { Metadata } from "next";
import { Package2, TrendingUp, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { ProcurementIntakeForm } from "@/components/procurement/intake-form";
import { StockAdjustmentDialog } from "@/components/procurement/stock-adjustment-dialog";

export const metadata: Metadata = { title: "Procurement — Frahman & Brothers" };

function formatTaka(poisha: number): string {
  const taka = poisha / 100;
  return "৳" + taka.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProcurementPage() {
  const [products, recentBatches] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryBatch.findMany({
      orderBy: { receivedDate: "desc" },
      take: 20,
      include: { product: { select: { name: true } } },
    }),
  ]);

  // Data for the adjustment dialog (all batches with remaining stock)
  const adjustmentBatches = recentBatches
    .filter((b) => b.currentBagsCount > 0)
    .map((b) => ({
      id: b.id,
      governmentChallanNo: b.governmentChallanNo,
      currentBagsCount: b.currentBagsCount,
      landedCostPerBagPoisha: b.landedCostPerBagPoisha,
      product: { name: b.product.name },
    }));

  // Summary stats
  const totalBatches = recentBatches.length;
  const totalBagsReceived = recentBatches.reduce((s, b) => s + b.initialBagsCount, 0);
  const totalInventoryValue = recentBatches.reduce(
    (s, b) => s + b.landedCostPerBagPoisha * b.initialBagsCount,
    0,
  );

  const stats = [
    {
      label: "Total Batches",
      value: totalBatches.toString(),
      icon: Package2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Bags Received",
      value: totalBagsReceived.toLocaleString("en-BD"),
      icon: Truck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Inventory Value",
      value: formatTaka(totalInventoryValue),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Procurement</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log government depot allocations and track landed costs
          </p>
        </div>
        <div className="ml-auto">
          <StockAdjustmentDialog batches={adjustmentBatches} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div
                  className={cn(
                    "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                    stat.bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <p className="truncate text-xl font-bold tabular-nums text-foreground md:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Intake form */}
      <ProcurementIntakeForm products={products} />

      {/* Recent batches table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Received Batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentBatches.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No batches recorded yet. Use the form above to log your first shipment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Challan No.
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Bags
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                      Base/bag
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                      Logistics/bag
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Landed/bag
                    </th>
                    <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentBatches.map((batch) => {
                    const logisticsPerBag =
                      batch.logisticsCostPoisha > 0
                        ? Math.round(batch.logisticsCostPoisha / batch.initialBagsCount)
                        : 0;
                    return (
                      <tr
                        key={batch.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                          {batch.governmentChallanNo}
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-medium text-foreground">
                            {batch.product.name}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right tabular-nums text-foreground">
                          {batch.initialBagsCount.toLocaleString("en-BD")}
                        </td>
                        <td className="hidden px-3 py-4 text-right tabular-nums text-muted-foreground sm:table-cell">
                          {formatTaka(batch.baseCostPerBagPoisha)}
                        </td>
                        <td className="hidden px-3 py-4 text-right tabular-nums text-muted-foreground md:table-cell">
                          {formatTaka(logisticsPerBag)}
                        </td>
                        <td className="px-3 py-4 text-right tabular-nums font-semibold text-emerald-400">
                          {formatTaka(batch.landedCostPerBagPoisha)}
                        </td>
                        <td className="hidden px-5 py-4 text-xs text-muted-foreground lg:table-cell">
                          {formatDate(batch.receivedDate)}
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
