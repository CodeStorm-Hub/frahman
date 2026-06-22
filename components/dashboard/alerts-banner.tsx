import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { AlertTriangle, Package } from "lucide-react";

const LOW_STOCK_THRESHOLD = 100; // bags

export async function AlertsBanner() {
  const [products, overdueInvoices] = await Promise.all([
    prisma.product.findMany({
      select: { name: true, batches: { select: { currentBagsCount: true } } },
    }),
    prisma.salesInvoice.findMany({
      where: {
        isPaid: false,
        invoiceDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: {
        totalAmountPoisha: true,
        retailer: { select: { shopName: true } },
      },
    }),
  ]);

  const lowStockItems = products
    .map((p) => ({
      name: p.name,
      bags: p.batches.reduce((s, b) => s + b.currentBagsCount, 0),
    }))
    .filter((p) => p.bags < LOW_STOCK_THRESHOLD);

  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.totalAmountPoisha, 0);

  if (lowStockItems.length === 0 && overdueInvoices.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {lowStockItems.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5"
        >
          <Package className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{item.name}</span> is low on stock —{" "}
            <span className="font-semibold tabular-nums">{item.bags.toLocaleString()} bags</span> remaining
          </p>
        </div>
      ))}

      {overdueInvoices.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            <span className="font-semibold tabular-nums">{overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""}</span>{" "}
            are 30+ days overdue —{" "}
            <span className="font-semibold">{formatTaka(overdueTotal)}</span> outstanding.{" "}
            <a href="/retailers" className="underline underline-offset-2 hover:no-underline">
              View retailers →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
