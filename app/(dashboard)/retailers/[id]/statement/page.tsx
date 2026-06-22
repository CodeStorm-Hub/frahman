import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatTaka } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { PrintButton } from "@/components/sales/print-button";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.retailer.findUnique({ where: { id }, select: { shopName: true } });
  return { title: r ? `Statement — ${r.shopName}` : "Statement" };
}

export default async function RetailerStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const retailer = await prisma.retailer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { invoiceDate: "asc" },
        include: { lines: { include: { product: { select: { name: true } } } } },
      },
    },
  });
  if (!retailer) notFound();

  // Build running-balance statement rows
  type Row = {
    date: Date;
    ref: string;
    description: string;
    debitPoisha: number;   // charge (invoice)
    creditPoisha: number;  // payment received
    balancePoisha: number;
  };

  // Fetch all PAY- journal entries that reference this retailer
  const paymentEntries = await prisma.journalEntry.findMany({
    where: {
      referenceNo: { startsWith: "PAY-" },
      description: { contains: retailer.shopName },
    },
    include: {
      lines: { where: { creditPoisha: { gt: 0 }, account: { code: "1300" } }, select: { creditPoisha: true } },
    },
    orderBy: { entryDate: "asc" },
  });

  // Merge invoices + payments into timeline
  const events: { date: Date; ref: string; desc: string; dr: number; cr: number }[] = [];

  for (const inv of retailer.invoices) {
    events.push({
      date: inv.invoiceDate,
      ref: inv.invoiceNo,
      desc: `Sales invoice — ${inv.lines.map((l) => `${l.bagsCount} bags ${l.product.name}`).join(", ")}`,
      dr: inv.totalAmountPoisha,
      cr: 0,
    });
  }
  for (const pay of paymentEntries) {
    const cr = pay.lines.reduce((s, l) => s + l.creditPoisha, 0);
    if (cr > 0) {
      events.push({ date: pay.entryDate, ref: pay.referenceNo, desc: pay.description, dr: 0, cr });
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  let running = 0;
  const rows: Row[] = events.map((e) => {
    running += e.dr - e.cr;
    return {
      date: e.date, ref: e.ref, description: e.desc,
      debitPoisha: e.dr, creditPoisha: e.cr, balancePoisha: running,
    };
  });

  const totalDebits = rows.reduce((s, r) => s + r.debitPoisha, 0);
  const totalCredits = rows.reduce((s, r) => s + r.creditPoisha, 0);
  const closingBalance = totalDebits - totalCredits;

  return (
    <div>
      {/* Screen-only header */}
      <div className="mb-6 flex items-center gap-3 print:hidden">
        <Link
          href={`/retailers/${id}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Account Statement</h1>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </div>

      {/* Statement document */}
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 print:max-w-none print:rounded-none print:border-none print:p-0">
        {/* Letterhead */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Frahman &amp; Brothers</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fertilizer Distributor · Pirojpur, Bangladesh
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">Account Statement</p>
            <p className="text-xs text-muted-foreground">
              Printed: {formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* Retailer info */}
        <div className="mb-6 rounded-lg border border-border bg-muted/20 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Shop Name:</span>{" "}
              <span className="font-semibold text-foreground">{retailer.shopName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Proprietor:</span>{" "}
              <span className="font-semibold text-foreground">{retailer.proprietorName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              <span className="font-mono text-foreground">{retailer.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Credit Limit:</span>{" "}
              <span className="tabular-nums text-foreground">{formatTaka(retailer.creditLimitPoisha)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Address:</span>{" "}
              <span className="text-foreground">{retailer.address}</span>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions on record for this account.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</th>
                <th className="hidden pb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">Description</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Charge</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-2.5 text-xs text-muted-foreground">{formatDate(row.date)}</td>
                  <td className="py-2.5 font-mono text-xs font-medium text-foreground">{row.ref}</td>
                  <td className="hidden py-2.5 text-xs text-muted-foreground sm:table-cell">
                    <span className="line-clamp-1 max-w-[220px]">{row.description}</span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-sm">
                    {row.debitPoisha > 0 ? (
                      <span className="text-foreground">{formatTaka(row.debitPoisha)}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-sm">
                    {row.creditPoisha > 0 ? (
                      <span className="text-emerald-500">{formatTaka(row.creditPoisha)}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className={cn(
                    "py-2.5 text-right tabular-nums text-sm font-semibold",
                    row.balancePoisha > 0 ? "text-foreground" : "text-emerald-500",
                  )}>
                    {formatTaka(row.balancePoisha)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td colSpan={3} className="pb-0 pt-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Totals
                </td>
                <td className="pb-0 pt-3 text-right tabular-nums font-bold text-foreground">
                  {formatTaka(totalDebits)}
                </td>
                <td className="pb-0 pt-3 text-right tabular-nums font-bold text-emerald-500">
                  {formatTaka(totalCredits)}
                </td>
                <td className="pb-0 pt-3 text-right tabular-nums font-bold text-foreground">
                  {formatTaka(closingBalance)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} className="pt-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Closing Balance (Amount Due)
                    </span>
                    <span className={cn(
                      "text-lg font-bold tabular-nums",
                      closingBalance > 0 ? "text-amber-500" : "text-emerald-500",
                    )}>
                      {formatTaka(closingBalance)}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-border pt-4 text-center text-[10px] text-muted-foreground/50">
          This is a computer-generated statement. No signature required.
          Frahman &amp; Brothers · Pirojpur, Bangladesh
        </div>
      </div>
    </div>
  );
}
