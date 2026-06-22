"use server";

import prisma from "@/lib/prisma";

export type SearchResult = {
  id: string;
  type: "retailer" | "invoice" | "product";
  title: string;
  subtitle: string;
  href: string;
};

export async function getSearchData(): Promise<SearchResult[]> {
  const [retailers, invoices, products] = await Promise.all([
    prisma.retailer.findMany({
      select: { id: true, shopName: true, proprietorName: true, phone: true },
      orderBy: { shopName: "asc" },
    }),
    prisma.salesInvoice.findMany({
      select: {
        id: true,
        invoiceNo: true,
        isPaid: true,
        retailer: { select: { shopName: true } },
      },
      orderBy: { invoiceDate: "desc" },
      take: 200,
    }),
    prisma.product.findMany({
      select: { id: true, name: true, chemicalSpec: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return [
    ...retailers.map((r) => ({
      id: r.id,
      type: "retailer" as const,
      title: r.shopName,
      subtitle: `${r.proprietorName} · ${r.phone}`,
      href: `/retailers/${r.id}`,
    })),
    ...invoices.map((i) => ({
      id: i.id,
      type: "invoice" as const,
      title: i.invoiceNo,
      subtitle: `${i.retailer.shopName} · ${i.isPaid ? "Settled" : "Outstanding"}`,
      href: `/sales/${i.id}`,
    })),
    ...products.map((p) => ({
      id: p.id,
      type: "product" as const,
      title: p.name,
      subtitle: p.chemicalSpec,
      href: `/products`,
    })),
  ];
}
