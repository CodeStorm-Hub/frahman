"use client";

import { CsvExportButton } from "@/components/ui/csv-export-button";

type Props = {
  rows: {
    entryDate: Date;
    referenceNo: string;
    entryDescription: string;
    accountCode: string;
    accountName: string;
    debitPoisha: number;
    creditPoisha: number;
  }[];
};

export function LedgerCsvExport({ rows }: Props) {
  const data = rows.map((r) => ({
    Date: new Date(r.entryDate).toLocaleDateString("en-BD", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    "Reference No": r.referenceNo,
    Description: r.entryDescription,
    "Account Code": r.accountCode,
    "Account Name": r.accountName,
    "Debit (BDT)": r.debitPoisha > 0 ? (r.debitPoisha / 100).toFixed(0) : "",
    "Credit (BDT)": r.creditPoisha > 0 ? (r.creditPoisha / 100).toFixed(0) : "",
  }));

  return <CsvExportButton data={data} filename="general-ledger" />;
}
