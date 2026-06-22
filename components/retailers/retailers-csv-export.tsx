"use client";

import { CsvExportButton } from "@/components/ui/csv-export-button";

type Props = {
  retailers: {
    shopName: string;
    proprietorName: string;
    phone: string;
    address: string;
    creditLimitPoisha: number;
    currentBalancePoisha: number;
    isAuthorized: boolean;
  }[];
};

export function RetailersCsvExport({ retailers }: Props) {
  const data = retailers.map((r) => ({
    "Shop Name": r.shopName,
    "Proprietor": r.proprietorName,
    Phone: r.phone,
    Address: r.address,
    "Credit Limit (BDT)": (r.creditLimitPoisha / 100).toFixed(0),
    "Outstanding (BDT)": (r.currentBalancePoisha / 100).toFixed(0),
    "Utilisation %": r.creditLimitPoisha > 0
      ? ((r.currentBalancePoisha / r.creditLimitPoisha) * 100).toFixed(1)
      : "0.0",
    Status: r.isAuthorized ? "Authorized" : "Suspended",
  }));

  return <CsvExportButton data={data} filename="retailers" />;
}
