import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  Store,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const kpis = [
  {
    label: "Procurement Volume",
    value: "৳12,40,000",
    change: "+8.2%",
    trend: "up" as const,
    sub: "This month",
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Active Retailers",
    value: "23",
    change: "+3",
    trend: "up" as const,
    sub: "vs last month",
    icon: Store,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Outstanding Credit",
    value: "৳3,40,000",
    change: "-5.1%",
    trend: "down" as const,
    sub: "Across all retailers",
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Net Cash Position",
    value: "৳8,92,500",
    change: "+12.4%",
    trend: "up" as const,
    sub: "Running total",
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const recentActivity = [
  {
    id: 1,
    description: "Ministry of Health — Medical Supplies PO-2024-034",
    amount: "+৳2,15,000",
    status: "Delivered",
    variant: "outline" as const,
    statusClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    time: "2h ago",
  },
  {
    id: 2,
    description: "Rahman Traders — Credit extended",
    amount: "৳40,000",
    status: "Pending",
    variant: "outline" as const,
    statusClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    time: "4h ago",
  },
  {
    id: 3,
    description: "Dhaka City Corp — Stationery Bulk PO-2024-033",
    amount: "+৳87,500",
    status: "In Transit",
    variant: "outline" as const,
    statusClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    time: "Yesterday",
  },
  {
    id: 4,
    description: "Karim Bros Wholesale — Credit repayment received",
    amount: "+৳60,000",
    status: "Settled",
    variant: "outline" as const,
    statusClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    time: "Yesterday",
  },
  {
    id: 5,
    description: "Utility bills — Warehouse & Office June 2024",
    amount: "-৳18,200",
    status: "Paid",
    variant: "outline" as const,
    statusClass: "border-border bg-muted/40 text-muted-foreground",
    time: "2 days ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Page heading — desktop only (mobile uses TopHeader) */}
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of operations &amp; key metrics
        </p>
      </div>

      {/* KPI grid: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      kpi.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                    {kpi.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent activity feed */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {item.amount}
                  </span>
                  <Badge
                    variant={item.variant}
                    className={cn("text-[10px]", item.statusClass)}
                  >
                    {item.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
