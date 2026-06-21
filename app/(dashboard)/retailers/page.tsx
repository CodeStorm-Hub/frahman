import type { Metadata } from "next";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { AddRetailerDialog } from "@/components/retailers/add-retailer-dialog";
import { RetailerTable } from "@/components/retailers/retailer-table";

export const metadata: Metadata = { title: "Retailers — Frahman & Brothers" };

function formatTaka(poisha: number) {
  return "৳" + (poisha / 100).toLocaleString("en-BD", { minimumFractionDigits: 0 });
}

export default async function RetailersPage() {
  const retailers = await prisma.retailer.findMany({ orderBy: { shopName: "asc" } });

  const totalCreditExtended = retailers.reduce((s, r) => s + r.currentBalancePoisha, 0);
  const totalOverLimit = retailers.filter(
    (r) => r.currentBalancePoisha > r.creditLimitPoisha,
  ).length;
  const activeCount = retailers.filter((r) => r.isAuthorized).length;

  const stats = [
    {
      label: "Total Credit Extended",
      value: formatTaka(totalCreditExtended),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Over-Limit Accounts",
      value: totalOverLimit.toString(),
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Authorized Retailers",
      value: activeCount.toString(),
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Retailers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorized B2B dealer directory &amp; credit accounts
          </p>
        </div>
        <AddRetailerDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div
                  className={cn(
                    "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                    s.bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", s.color)} />
                </div>
                <p className="truncate text-xl font-bold tabular-nums text-foreground md:text-2xl">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Retailer table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Credit Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0">
          <RetailerTable retailers={retailers} />
        </CardContent>
      </Card>
    </div>
  );
}
