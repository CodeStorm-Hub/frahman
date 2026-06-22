"use client";

import { useState, useMemo } from "react";
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

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
        header: () => (
          <th className="hidden px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
            Items
          </th>
        ),
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
    data: invoices,
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
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
              {row.getVisibleCells().map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext()),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
