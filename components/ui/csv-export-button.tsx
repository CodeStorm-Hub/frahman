"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = Record<string, string | number | boolean | null | undefined>;

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function CsvExportButton({
  data,
  filename,
  className,
}: {
  data: Row[];
  filename: string;
  className?: string;
}) {
  function handleExport() {
    const csv = toCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={data.length === 0}
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground",
        "transition-colors hover:border-border/80 hover:bg-muted/50 hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </button>
  );
}
