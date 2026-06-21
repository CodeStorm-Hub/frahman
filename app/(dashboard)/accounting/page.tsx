import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Accounting" };

const balanceSummary = [
  {
    label: "Total Receipts",
    value: "৳24,80,000",
    icon: ArrowDownLeft,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    sub: "This month",
  },
  {
    label: "Total Payments",
    value: "৳15,87,500",
    icon: ArrowUpRight,
    color: "text-red-400",
    bg: "bg-red-500/10",
    sub: "This month",
  },
  {
    label: "Net Balance",
    value: "৳8,92,500",
    icon: Wallet,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    sub: "Running total",
  },
];

const ledgerEntries = [
  {
    date: "22 Jun 2024",
    ref: "REC-089",
    description: "Ministry of Health — PO-2024-034",
    debit: "",
    credit: "৳2,15,000",
    balance: "৳8,92,500",
    type: "receipt",
  },
  {
    date: "21 Jun 2024",
    ref: "PAY-041",
    description: "Supplier — Office Supplies Purchase",
    debit: "৳42,000",
    credit: "",
    balance: "৳6,77,500",
    type: "payment",
  },
  {
    date: "20 Jun 2024",
    ref: "REC-088",
    description: "Karim Bros Wholesale — Credit repayment",
    debit: "",
    credit: "৳60,000",
    balance: "৳7,19,500",
    type: "receipt",
  },
  {
    date: "19 Jun 2024",
    ref: "PAY-040",
    description: "Warehouse Rent — June 2024",
    debit: "৳35,000",
    credit: "",
    balance: "৳6,59,500",
    type: "payment",
  },
  {
    date: "18 Jun 2024",
    ref: "REC-087",
    description: "Ministry of Education — PO-2024-032",
    debit: "",
    credit: "৳2,40,000",
    balance: "৳6,94,500",
    type: "receipt",
  },
  {
    date: "17 Jun 2024",
    ref: "PAY-039",
    description: "Staff Salaries — June 2024",
    debit: "৳1,20,000",
    credit: "",
    balance: "৳4,54,500",
    type: "payment",
  },
  {
    date: "16 Jun 2024",
    ref: "PAY-038",
    description: "Utility Bills — Electricity & Water",
    debit: "৳18,200",
    credit: "",
    balance: "৳5,74,500",
    type: "payment",
  },
  {
    date: "15 Jun 2024",
    ref: "REC-086",
    description: "BWDB — PO-2024-029",
    debit: "",
    credit: "৳1,76,000",
    balance: "৳5,92,700",
    type: "receipt",
  },
  {
    date: "14 Jun 2024",
    ref: "REC-085",
    description: "Al-Amin Stores — Full repayment",
    debit: "",
    credit: "৳55,000",
    balance: "৳4,16,700",
    type: "receipt",
  },
  {
    date: "12 Jun 2024",
    ref: "PAY-037",
    description: "Vehicle Maintenance — Delivery Van",
    debit: "৳12,500",
    credit: "",
    balance: "৳3,61,700",
    type: "payment",
  },
];

export default function AccountingPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">
          Accounting Ledgers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Financial records, receipts and payments
        </p>
      </div>

      {/* Balance summary: 3-col grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {balanceSummary.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div
                  className={cn(
                    "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                    stat.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <p className="text-base font-bold tabular-nums leading-tight text-foreground md:text-lg">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* General ledger table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            General Ledger — June 2024
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                    Ref
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                    Debit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                    Credit
                  </th>
                  <th className="hidden px-5 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.map((entry, i) => (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground">
                      {entry.date}
                    </td>
                    <td className="hidden px-3 py-3.5 font-mono text-xs text-muted-foreground/60 sm:table-cell">
                      {entry.ref}
                    </td>
                    <td className="max-w-[160px] px-3 py-3.5 md:max-w-none">
                      <span className="block truncate text-sm text-foreground">
                        {entry.description}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      {entry.debit ? (
                        <span className="text-sm font-medium text-red-400">
                          {entry.debit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/25">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      {entry.credit ? (
                        <span className="text-sm font-medium text-emerald-400">
                          {entry.credit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/25">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3.5 text-right tabular-nums text-sm font-semibold text-foreground sm:table-cell">
                      {entry.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
