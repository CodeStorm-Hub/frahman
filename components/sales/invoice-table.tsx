"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { SortHeader } from "@/components/ui/sort-header";
import { cn } from "@/lib/utils";
import { formatTaka } from "@/lib/currency";
import { CalendarDays, X } from "lucide-react";

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  invoiceDate: Date;
  retailerName: string;
  proprietorName: string;
  itemsSummary: string;
  totalAmountPoisha: number;
  isPaid: boolean;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    if (!fromDate && !toDate) return invoices;
    const from = fromDate ? new Date(fromDate).getTime() : 0;
    const to = toDate ? new Date(toDate).getTime() + 86_400_000 : Infinity;
    return invoices.filter((inv) => {
      const t = new Date(inv.invoiceDate).getTime();
      return t >= from && t <= to;
    });
  }, [invoices, fromDate, toDate]);

  const hasFilter = !!fromDate || !!toDate;

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        id: "invoiceNo",
        accessorFn: (r) => r.invoiceNo,
        header: ({ column }) => (
          <SortHeader column={column}>Invoice No.</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">
            <Link
              href={`/sales/${r.id}`}
              className="underline-offset-2 hover:underline"
            >
              {r.invoiceNo}
            </Link>
          </td>
        ),
      },
      {
        id: "retailer",
        accessorFn: (r) => r.retailerName,
        header: ({ column }) => (
          <SortHeader column={column}>Retailer</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="px-3 py-3.5">
            <p className="font-medium text-foreground">{r.retailerName}</p>
            <p className="text-xs text-muted-foreground">{r.proprietorName}</p>
          </td>
        ),
      },
      {
        id: "items",
        accessorKey: "itemsSummary",
        enableSorting: false,
        header: () => "Items",
        cell: ({ row: { original: r } }) => (
          <td className="hidden px-3 py-3.5 text-xs text-muted-foreground sm:table-cell">
            <span className="line-clamp-1 max-w-[200px]">{r.itemsSummary}</span>
          </td>
        ),
      },
      {
        id: "amount",
        accessorFn: (r) => r.totalAmountPoisha,
        header: ({ column }) => (
          <SortHeader column={column} className="ml-auto">
            Amount
          </SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="px-3 py-3.5 text-right tabular-nums font-semibold text-foreground">
            {formatTaka(r.totalAmountPoisha)}
          </td>
        ),
      },
      {
        id: "status",
        accessorFn: (r) => (r.isPaid ? 1 : 0),
        header: ({ column }) => (
          <SortHeader column={column}>Status</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="px-3 py-3.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                r.isPaid
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-400",
              )}
            >
              {r.isPaid ? "Settled" : "Outstanding"}
            </span>
          </td>
        ),
      },
      {
        id: "date",
        accessorFn: (r) => new Date(r.invoiceDate).getTime(),
        header: ({ column }) => (
          <SortHeader column={column}>Date</SortHeader>
        ),
        cell: ({ row: { original: r } }) => (
          <td className="hidden px-5 py-3.5 text-xs text-muted-foreground md:table-cell">
            {formatDate(r.invoiceDate)}
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

  if (invoices.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        No invoices yet.{" "}
        <Link href="/sales/new" className="text-foreground underline underline-offset-2">
          Create your first sale.
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Date-range filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Filter by date:</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded border border-border bg-muted/20 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="From date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="date"
          value={toDate}
          min={fromDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded border border-border bg-muted/20 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="To date"
        />
        {hasFilter && (
          <button
            onClick={() => { setFromDate(""); setToDate(""); }}
            className="flex items-center gap-1 rounded border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        {hasFilter && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {invoices.length} shown
          </span>
        )}
      </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className={cn(
                  "px-3 py-3 text-left first:px-5",
                  header.id === "items" && "hidden sm:table-cell",
                  header.id === "date" && "hidden md:table-cell",
                )}
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
    </div>
  );
}
