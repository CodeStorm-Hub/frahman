import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Plus, Users, TrendingUp, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { SalesCsvExport } from "@/components/sales/sales-csv-export";
import { InvoiceTable } from "@/components/sales/invoice-table";

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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">All Invoices</CardTitle>
          <SalesCsvExport
            invoices={invoices.map((inv) => ({
              invoiceNo: inv.invoiceNo,
              invoiceDate: inv.invoiceDate,
              retailerName: inv.retailer.shopName,
              totalAmountPoisha: inv.totalAmountPoisha,
              isPaid: inv.isPaid,
              itemsSummary: inv.lines.map((l) => `${l.bagsCount} ${l.product.name}`).join(", "),
            }))}
          />
        </CardHeader>
        <CardContent className="p-0">
          <InvoiceTable
            invoices={invoices.map((inv) => ({
              id: inv.id,
              invoiceNo: inv.invoiceNo,
              invoiceDate: inv.invoiceDate,
              retailerName: inv.retailer.shopName,
              proprietorName: inv.retailer.proprietorName,
              itemsSummary: inv.lines.map((l) => `${l.bagsCount} ${l.product.name}`).join(", "),
              totalAmountPoisha: inv.totalAmountPoisha,
              isPaid: inv.isPaid,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
