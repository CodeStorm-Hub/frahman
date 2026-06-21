import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { SaleBuilder } from "@/components/sales/sale-builder";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = { title: "New Sale — Frahman & Brothers" };

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ retailerId?: string }>;
}) {
  const { retailerId: preselectedRetailerId } = await searchParams;

  const [rawProducts, retailers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        batches: {
          where: { currentBagsCount: { gt: 0 } },
          select: { currentBagsCount: true },
        },
      },
    }),
    prisma.retailer.findMany({
      orderBy: { shopName: "asc" },
      select: {
        id: true,
        shopName: true,
        proprietorName: true,
        creditLimitPoisha: true,
        currentBalancePoisha: true,
        isAuthorized: true,
      },
    }),
  ]);

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    chemicalSpec: p.chemicalSpec,
    officialRatePerBag: p.officialRatePerBag,
    availableBags: p.batches.reduce((s, b) => s + b.currentBagsCount, 0),
  }));

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton fallbackHref="/retailers" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">New Credit Sale</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select retailer, build order, and confirm to generate invoice
          </p>
        </div>
      </div>

      <SaleBuilder
        products={products}
        retailers={retailers}
        preselectedRetailerId={preselectedRetailerId}
      />
    </div>
  );
}
