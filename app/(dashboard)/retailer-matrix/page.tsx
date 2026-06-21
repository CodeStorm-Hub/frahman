import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, AlertCircle, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Retailer Matrix" };

const summary = [
  {
    label: "Total Credit Extended",
    value: "৳12,80,000",
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Overdue Balances",
    value: "৳2,40,000",
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    label: "Active Retailers",
    value: "23",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const retailers = [
  {
    id: 1,
    name: "Rahman Traders",
    area: "Motijheel",
    creditLimit: "৳1,00,000",
    outstanding: "৳40,000",
    daysOverdue: 0,
    status: "Current",
    lastActivity: "21 Jun 2024",
  },
  {
    id: 2,
    name: "Karim Bros Wholesale",
    area: "Shyamoli",
    creditLimit: "৳75,000",
    outstanding: "৳75,000",
    daysOverdue: 0,
    status: "At Limit",
    lastActivity: "19 Jun 2024",
  },
  {
    id: 3,
    name: "Bismillah Enterprise",
    area: "Mirpur",
    creditLimit: "৳60,000",
    outstanding: "৳85,000",
    daysOverdue: 12,
    status: "Overdue",
    lastActivity: "08 Jun 2024",
  },
  {
    id: 4,
    name: "Hasan & Sons",
    area: "Demra",
    creditLimit: "৳50,000",
    outstanding: "৳22,000",
    daysOverdue: 0,
    status: "Current",
    lastActivity: "20 Jun 2024",
  },
  {
    id: 5,
    name: "Al-Amin Stores",
    area: "Keraniganj",
    creditLimit: "৳80,000",
    outstanding: "৳0",
    daysOverdue: 0,
    status: "Clear",
    lastActivity: "15 Jun 2024",
  },
  {
    id: 6,
    name: "Chowdhury Distributors",
    area: "Narayanganj",
    creditLimit: "৳1,50,000",
    outstanding: "৳1,20,000",
    daysOverdue: 31,
    status: "Overdue",
    lastActivity: "20 May 2024",
  },
  {
    id: 7,
    name: "Noor Trading",
    area: "Uttara",
    creditLimit: "৳40,000",
    outstanding: "৳18,500",
    daysOverdue: 0,
    status: "Current",
    lastActivity: "22 Jun 2024",
  },
  {
    id: 8,
    name: "Metro Retail Co.",
    area: "Gulshan",
    creditLimit: "৳2,00,000",
    outstanding: "৳0",
    daysOverdue: 0,
    status: "New",
    lastActivity: "22 Jun 2024",
  },
];

const statusStyles: Record<string, string> = {
  Current:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  Clear:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  "At Limit":
    "border-amber-500/25 bg-amber-500/10 text-amber-400",
  Overdue:
    "border-red-500/25 bg-red-500/10 text-red-400",
  New:
    "border-blue-500/25 bg-blue-500/10 text-blue-400",
};

export default function RetailerMatrixPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">
          Retailer Matrix
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          B2B credit accounts and outstanding balances
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {summary.map((stat) => {
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
                <p className="text-lg font-bold tabular-nums leading-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Retailers credit table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Credit Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Retailer
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                    Area
                  </th>
                  <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                    Credit Limit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                    Outstanding
                  </th>
                  <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                    Days Overdue
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {retailers.map((r) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {r.name}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-muted-foreground sm:table-cell">
                      {r.area}
                    </td>
                    <td className="hidden px-3 py-4 text-right tabular-nums text-sm text-muted-foreground md:table-cell">
                      {r.creditLimit}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-4 text-right tabular-nums text-sm font-semibold",
                        r.daysOverdue > 0
                          ? "text-red-400"
                          : r.outstanding === "৳0"
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                      )}
                    >
                      {r.outstanding}
                    </td>
                    <td className="hidden px-3 py-4 text-right sm:table-cell">
                      {r.daysOverdue > 0 ? (
                        <span className="text-sm font-semibold text-red-400">
                          {r.daysOverdue}d
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          statusStyles[r.status] ?? statusStyles["Current"]
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-xs text-muted-foreground md:table-cell">
                      {r.lastActivity}
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
