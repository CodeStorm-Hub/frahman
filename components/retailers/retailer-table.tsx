"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RetailerRow = {
  id: string;
  shopName: string;
  proprietorName: string;
  phone: string;
  address: string;
  creditLimitPoisha: number;
  currentBalancePoisha: number;
  isAuthorized: boolean;
};

function formatTaka(poisha: number) {
  return "৳" + (poisha / 100).toLocaleString("en-BD", { minimumFractionDigits: 0 });
}

function utilizationPct(balance: number, limit: number) {
  if (limit === 0) return 0;
  return Math.min(Math.round((balance / limit) * 100), 100);
}

export function RetailerTable({ retailers }: { retailers: RetailerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = retailers.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.shopName.toLowerCase().includes(q) ||
      r.proprietorName.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by shop name, proprietor, or phone…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {query ? `No retailers match "${query}".` : "No retailers registered yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Business
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                  Phone
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                  Outstanding
                </th>
                <th className="hidden px-3 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                  Credit Limit
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                  Utilisation
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const pct = utilizationPct(r.currentBalancePoisha, r.creditLimitPoisha);
                const isAtLimit = r.currentBalancePoisha >= r.creditLimitPoisha;
                const isOverLimit = r.currentBalancePoisha > r.creditLimitPoisha;
                const statusLabel = !r.isAuthorized
                  ? "Suspended"
                  : isOverLimit
                    ? "Over Limit"
                    : isAtLimit
                      ? "At Limit"
                      : r.currentBalancePoisha === 0
                        ? "Clear"
                        : "Current";
                const statusStyle = !r.isAuthorized
                  ? "border-red-500/25 bg-red-500/10 text-red-400"
                  : isOverLimit
                    ? "border-red-500/25 bg-red-500/10 text-red-400"
                    : isAtLimit
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
                      : r.currentBalancePoisha === 0
                        ? "border-border bg-muted/20 text-muted-foreground"
                        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";

                return (
                  <tr key={r.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{r.shopName}</p>
                      <p className="text-xs text-muted-foreground">{r.proprietorName}</p>
                    </td>
                    <td className="hidden px-3 py-3.5 font-mono text-xs text-muted-foreground sm:table-cell">
                      {r.phone}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3.5 text-right tabular-nums font-semibold",
                        isOverLimit ? "text-red-400" : isAtLimit ? "text-amber-400" : "text-foreground",
                      )}
                    >
                      {formatTaka(r.currentBalancePoisha)}
                    </td>
                    <td className="hidden px-3 py-3.5 text-right tabular-nums text-muted-foreground md:table-cell">
                      {formatTaka(r.creditLimitPoisha)}
                    </td>
                    <td className="hidden px-3 py-3.5 lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          statusStyle,
                        )}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <Link
                        href={`/sales/new?retailerId=${r.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 px-2 text-xs")}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        New Sale
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
