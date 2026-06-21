import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "General Ledger — Frahman & Brothers" };

function formatTaka(poisha: number): string {
  if (poisha === 0) return "";
  const taka = poisha / 100;
  return "৳" + taka.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function LedgersPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { entryDate: "desc" },
    include: {
      lines: {
        include: {
          account: { select: { code: true, name: true } },
        },
        orderBy: { debitPoisha: "desc" },
      },
    },
  });

  // Flatten to rows, tagging the first line of each entry
  type LedgerRow = {
    isFirst: boolean;
    isLast: boolean;
    entryDate: Date;
    referenceNo: string;
    entryDescription: string;
    accountCode: string;
    accountName: string;
    debitPoisha: number;
    creditPoisha: number;
  };

  const rows: LedgerRow[] = entries.flatMap((entry) =>
    entry.lines.map((line, i) => ({
      isFirst: i === 0,
      isLast: i === entry.lines.length - 1,
      entryDate: entry.entryDate,
      referenceNo: entry.referenceNo,
      entryDescription: entry.description,
      accountCode: line.account.code,
      accountName: line.account.name,
      debitPoisha: line.debitPoisha,
      creditPoisha: line.creditPoisha,
    })),
  );

  const totalDebit = rows.reduce((s, r) => s + r.debitPoisha, 0);
  const totalCredit = rows.reduce((s, r) => s + r.creditPoisha, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">General Ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full audit trail of every journal entry and its double-entry lines
        </p>
      </div>

      {/* Balance indicator */}
      <div className="flex items-center gap-3">
        <div
          className={
            isBalanced
              ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
              : "rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
          }
        >
          {isBalanced ? "✓ Ledger balanced" : "⚠ Ledger out of balance"}
        </div>
        <span className="text-xs text-muted-foreground">
          {entries.length} journal {entries.length === 1 ? "entry" : "entries"} ·{" "}
          {rows.length} ledger lines
        </span>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Journal Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No journal entries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Reference No.
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      Description / Account
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                      Debit
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isFirst
                          ? "border-t border-border bg-muted/10 transition-colors hover:bg-muted/20"
                          : "transition-colors hover:bg-muted/10"
                      }
                    >
                      {/* Date — only on first line of each entry */}
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">
                        {row.isFirst ? formatDate(row.entryDate) : ""}
                      </td>

                      {/* Reference No — only on first line */}
                      <td className="px-3 py-2.5">
                        {row.isFirst ? (
                          <span className="font-mono text-xs font-medium text-foreground">
                            {row.referenceNo}
                          </span>
                        ) : (
                          ""
                        )}
                      </td>

                      {/* Description (entry) on first line, then account name for child lines */}
                      <td className="px-3 py-2.5">
                        {row.isFirst ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {row.entryDescription}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {row.accountCode} · {row.accountName}
                            </p>
                          </div>
                        ) : (
                          <p className="pl-3 text-xs text-muted-foreground">
                            {row.accountCode} · {row.accountName}
                          </p>
                        )}
                      </td>

                      {/* Debit */}
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {row.debitPoisha > 0 ? (
                          <span className="font-medium text-foreground">
                            {formatTaka(row.debitPoisha)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>

                      {/* Credit */}
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {row.creditPoisha > 0 ? (
                          <span className="font-medium text-foreground">
                            {formatTaka(row.creditPoisha)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Totals footer */}
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td
                      colSpan={3}
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Totals
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="text-sm font-bold text-foreground">
                        {formatTaka(totalDebit)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className="text-sm font-bold text-foreground">
                        {formatTaka(totalCredit)}
                      </span>
                    </td>
                  </tr>
                  {!isBalanced && (
                    <tr className="bg-red-500/5">
                      <td
                        colSpan={5}
                        className="px-5 py-2 text-center text-xs text-red-400"
                      >
                        Ledger is out of balance by{" "}
                        {formatTaka(Math.abs(totalDebit - totalCredit))}. This indicates a
                        data integrity error.
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
