"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { SortHeader } from "@/components/ui/sort-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTaka } from "@/lib/currency";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { EditRetailerDialog } from "./edit-retailer-dialog";

export type RetailerRow = {
  id: string;
  shopName: string;
  proprietorName: string;
  phone: string;
  address: string;
  creditLimitPoisha: number;
  currentBalancePoisha: number;
  isAuthorized: boolean;
  tradeLicenseNo?: string | null;
  tradeLicenseExpiry?: Date | null;
  isVerified?: boolean;
};

function utilizationPct(balance: number, limit: number) {
  if (limit === 0) return 0;
  return Math.min(Math.round((balance / limit) * 100), 100);
}

export function RetailerTable({ retailers }: { retailers: RetailerRow[] }) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return retailers;
    return retailers.filter(
      (r) =>
        r.shopName.toLowerCase().includes(q) ||
        r.proprietorName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.address.toLowerCase().includes(q),
    );
  }, [retailers, query]);

  const columns = useMemo<ColumnDef<RetailerRow>[]>(
    () => [
      {
        id: "business",
        accessorFn: (r) => r.shopName,
        header: ({ column }) => (
          <SortHeader column={column}>Business</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="px-5 py-3.5">
            <Link
              href={`/retailers/${r.id}`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {r.shopName}
            </Link>
            <p className="text-xs text-muted-foreground">{r.proprietorName}</p>
          </td>
        ),
      },
      {
        id: "phone",
        accessorFn: (r) => r.phone,
        header: ({ column }) => (
          <SortHeader column={column}>Phone</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="hidden px-3 py-3.5 font-mono text-xs text-muted-foreground sm:table-cell">
            {r.phone}
          </td>
        ),
      },
      {
        id: "balance",
        accessorFn: (r) => r.currentBalancePoisha,
        header: ({ column }) => (
          <SortHeader column={column} className="ml-auto">
            Outstanding
          </SortHeader>
        ),
        cell: ({ row: { original: r } }) => {
          const isOver = r.currentBalancePoisha > r.creditLimitPoisha;
          const isAt = r.currentBalancePoisha >= r.creditLimitPoisha;
          return (
            <td
              className={cn(
                "px-3 py-3.5 text-right tabular-nums font-semibold",
                isOver
                  ? "text-red-400"
                  : isAt
                    ? "text-amber-400"
                    : "text-foreground",
              )}
            >
              {formatTaka(r.currentBalancePoisha)}
            </td>
          );
        },
      },
      {
        id: "limit",
        accessorFn: (r) => r.creditLimitPoisha,
        header: ({ column }) => (
          <SortHeader column={column} className="ml-auto">
            Credit Limit
          </SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="hidden px-3 py-3.5 text-right tabular-nums text-muted-foreground md:table-cell">
            {formatTaka(r.creditLimitPoisha)}
          </td>
        ),
      },
      {
        id: "utilisation",
        accessorFn: (r) => utilizationPct(r.currentBalancePoisha, r.creditLimitPoisha),
        header: ({ column }) => (
          <SortHeader column={column}>Utilisation</SortHeader>
        ),
        cell: ({ row: { original: r } }) => {
          const pct = utilizationPct(r.currentBalancePoisha, r.creditLimitPoisha);
          return (
            <td className="hidden px-3 py-3.5 lg:table-cell">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct >= 100
                        ? "bg-red-500"
                        : pct >= 80
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
            </td>
          );
        },
      },
      {
        id: "status",
        accessorFn: (r) => (r.isAuthorized ? 1 : 0),
        header: ({ column }) => (
          <SortHeader column={column}>Status</SortHeader>
        ),
        cell: ({ row: { original: r } }) => {
          const isOver = r.currentBalancePoisha > r.creditLimitPoisha;
          const isAt = r.currentBalancePoisha >= r.creditLimitPoisha;
          const label = !r.isAuthorized
            ? "Suspended"
            : isOver
              ? "Over Limit"
              : isAt
                ? "At Limit"
                : r.currentBalancePoisha === 0
                  ? "Clear"
                  : "Current";
          const style = !r.isAuthorized
            ? "border-red-500/25 bg-red-500/10 text-red-400"
            : isOver
              ? "border-red-500/25 bg-red-500/10 text-red-400"
              : isAt
                ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
                : r.currentBalancePoisha === 0
                  ? "border-border bg-muted/20 text-muted-foreground"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
          return (
            <td className="px-3 py-3.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  style,
                )}
              >
                {label}
              </span>
            </td>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => null,
        cell: ({ row: { original: r } }) => (
          <td className="px-3 py-3.5">
            <div className="flex items-center justify-end gap-1.5">
              <EditRetailerDialog retailer={r} />
              {r.currentBalancePoisha > 0 && (
                <RecordPaymentDialog
                  retailerId={r.id}
                  shopName={r.shopName}
                  currentBalancePoisha={r.currentBalancePoisha}
                />
              )}
              <Link
                href={`/sales/new?retailerId=${r.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-7 px-2 text-xs",
                )}
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                New Sale
              </Link>
            </div>
          </td>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

      {table.getRowModel().rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {query ? `No retailers match "${query}".` : "No retailers registered yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left first:px-5"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/20">
                  {row.getVisibleCells().map((cell) => (
                    <Fragment key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
