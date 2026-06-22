"use client";

import { CsvExportButton } from "@/components/ui/csv-export-button";

type Props = {
  invoices: {
    invoiceNo: string;
    invoiceDate: Date;
    retailerName: string;
    totalAmountPoisha: number;
    isPaid: boolean;
    itemsSummary: string;
  }[];
};

export function SalesCsvExport({ invoices }: Props) {
  const data = invoices.map((inv) => ({
    "Invoice No": inv.invoiceNo,
    Date: new Date(inv.invoiceDate).toLocaleDateString("en-BD", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    Retailer: inv.retailerName,
    Items: inv.itemsSummary,
    "Amount (BDT)": (inv.totalAmountPoisha / 100).toFixed(0),
    Status: inv.isPaid ? "Settled" : "Outstanding",
  }));

  return <CsvExportButton data={data} filename="invoices" />;
}
