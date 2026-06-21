import type { Metadata } from "next";
import { FlaskConical, Package, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";

export const metadata: Metadata = { title: "Products — Frahman & Brothers" };

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      batches: {
        select: { currentBagsCount: true },
      },
      salesLines: {
        select: { bagsCount: true },
      },
    },
  });

  const totalProducts = products.length;
  const totalBagsOnHand = products.reduce(
    (sum, p) => sum + p.batches.reduce((s, b) => s + b.currentBagsCount, 0),
    0,
  );
  const totalBagsSold = products.reduce(
    (sum, p) => sum + p.salesLines.reduce((s, l) => s + l.bagsCount, 0),
    0,
  );
  const totalCatalogueValue = products.reduce(
    (sum, p) => sum + p.officialRatePerBag * p.batches.reduce((s, b) => s + b.currentBagsCount, 0),
    0,
  );

  const kpis = [
    {
      label: "Products",
      value: totalProducts.toString(),
      icon: FlaskConical,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Bags on Hand",
      value: totalBagsOnHand.toLocaleString("en-BD"),
      icon: Package,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Catalogue Value",
      value: formatTaka(totalCatalogueValue),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Bags Sold",
      value: totalBagsSold.toLocaleString("en-BD"),
      icon: Layers,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fertilizer catalogue — names, specs, and government-regulated prices
          </p>
        </div>
        <AddProductDialog />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", kpi.bg)}>
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

      {/* Products table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Product Catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No products yet. Add your first fertilizer product above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Chemical Spec
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Govt. Rate / Bag
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Bags on Hand
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                      Stock Value
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                      Bags Sold
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => {
                    const bagsOnHand = p.batches.reduce((s, b) => s + b.currentBagsCount, 0);
                    const bagsSold = p.salesLines.reduce((s, l) => s + l.bagsCount, 0);
                    const stockValue = p.officialRatePerBag * bagsOnHand;

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-5 py-3.5 font-semibold text-foreground">
                          {p.name}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-muted-foreground">
                          {p.chemicalSpec}
                        </td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-foreground">
                          {formatTaka(p.officialRatePerBag)}
                        </td>
                        <td className="px-3 py-3.5 text-right tabular-nums">
                          <span
                            className={cn(
                              "font-semibold",
                              bagsOnHand === 0 ? "text-red-400" : "text-foreground",
                            )}
                          >
                            {bagsOnHand.toLocaleString("en-BD")}
                          </span>
                        </td>
                        <td className="hidden px-3 py-3.5 text-right tabular-nums text-muted-foreground md:table-cell">
                          {formatTaka(stockValue)}
                        </td>
                        <td className="hidden px-3 py-3.5 text-right tabular-nums text-muted-foreground sm:table-cell">
                          {bagsSold.toLocaleString("en-BD")}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <EditProductDialog
                            product={{
                              id: p.id,
                              name: p.name,
                              chemicalSpec: p.chemicalSpec,
                              officialRatePerBag: p.officialRatePerBag,
                            }}
                          />
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
