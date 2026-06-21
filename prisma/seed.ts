import { toPoisha } from "../lib/currency";
import prisma from "../lib/prisma";

async function main() {
  // -------------------------------------------------------------------------
  // Products — core fertilizer catalogue
  // Official rates are published in BDT per 50 kg bag; stored as Poisha.
  // -------------------------------------------------------------------------
  const products = [
    { name: "Urea", chemicalSpec: "46% Nitrogen",          officialRatePerBag: toPoisha(1350) },
    { name: "TSP",  chemicalSpec: "46% P2O5",              officialRatePerBag: toPoisha(1350) },
    { name: "MOP",  chemicalSpec: "60% K2O",               officialRatePerBag: toPoisha(1000) },
    { name: "DAP",  chemicalSpec: "Nitrogen + Phosphorus",  officialRatePerBag: toPoisha(1050) },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where:  { name: product.name },
      update: { chemicalSpec: product.chemicalSpec, officialRatePerBag: product.officialRatePerBag },
      create: product,
    });
  }

  // -------------------------------------------------------------------------
  // Chart of Accounts
  // Codes follow standard accounting structure:
  //   1xxx = Assets  |  2xxx = Liabilities  |  3xxx = Equity
  //   4xxx = Revenue |  5xxx = Expenses
  // -------------------------------------------------------------------------
  const accounts = [
    { code: "1100", name: "Cash & Bank",                 category: "ASSET"     as const },
    { code: "1200", name: "Inventory Asset",              category: "ASSET"     as const },
    { code: "1300", name: "Accounts Receivable",          category: "ASSET"     as const },
    { code: "2100", name: "Accounts Payable",             category: "LIABILITY" as const },
    { code: "4100", name: "Wholesale Fertilizer Revenue", category: "REVENUE"   as const },
    { code: "5100", name: "Cost of Goods Sold",           category: "EXPENSE"   as const },
    { code: "5200", name: "Inventory Loss",               category: "EXPENSE"   as const },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where:  { code: account.code },
      update: { name: account.name, category: account.category },
      create: account,
    });
  }

  console.log(`Seeded ${products.length} products.`);
  console.log(`Seeded ${accounts.length} chart-of-accounts entries.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
