"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { toPoisha } from "@/lib/currency";

export type ProcurementFormState = {
  status: "idle" | "success" | "error";
  message: string;
  batchId?: string;
  landedCostPerBagPoisha?: number;
};

export async function logProcurementIntake(
  prevState: ProcurementFormState,
  formData: FormData,
): Promise<ProcurementFormState> {
  const productId = formData.get("productId") as string;
  const bagsCountRaw = formData.get("bagsCount") as string;
  const governmentChallanNo = (formData.get("governmentChallanNo") as string)?.trim();
  const transportTruckFeeTaka = formData.get("transportTruckFeeTaka") as string;
  const coolieLaborFeeTaka = formData.get("coolieLaborFeeTaka") as string;
  const creditAccountCode = (formData.get("creditAccountCode") as string) || "2100";

  // -- Validation --
  if (!productId) return { status: "error", message: "Please select a product." };
  if (!governmentChallanNo) return { status: "error", message: "Government challan number is required." };

  const bagsCount = parseInt(bagsCountRaw, 10);
  if (!bagsCount || bagsCount <= 0) return { status: "error", message: "Bags count must be a positive whole number." };

  const transportFee = parseFloat(transportTruckFeeTaka);
  const coolieFee = parseFloat(coolieLaborFeeTaka);
  if (isNaN(transportFee) || transportFee < 0) return { status: "error", message: "Transport fee must be a valid non-negative number." };
  if (isNaN(coolieFee) || coolieFee < 0) return { status: "error", message: "Coolie labor fee must be a valid non-negative number." };
  if (!["1100", "2100"].includes(creditAccountCode)) return { status: "error", message: "Invalid credit account." };

  // -- Cost computation (all in Poisha) --
  const transportFeePoisha = toPoisha(transportFee);
  const coolieFeePoisha = toPoisha(coolieFee);
  const totalLogisticsCostPoisha = transportFeePoisha + coolieFeePoisha;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

      const [inventoryAccount, creditAccount] = await Promise.all([
        tx.account.findUniqueOrThrow({ where: { code: "1200" } }),
        tx.account.findUniqueOrThrow({ where: { code: creditAccountCode } }),
      ]);

      const baseCostPerBagPoisha = product.officialRatePerBag;
      // Integer division — fractional poisha remainder is absorbed into the batch total
      const logisticsPerBagPoisha = Math.round(totalLogisticsCostPoisha / bagsCount);
      const landedCostPerBagPoisha = baseCostPerBagPoisha + logisticsPerBagPoisha;
      // Total debited = full landed cost across all bags (avoids per-bag rounding errors)
      const totalLandedPoisha = baseCostPerBagPoisha * bagsCount + totalLogisticsCostPoisha;

      // 1. Create InventoryBatch
      const batch = await tx.inventoryBatch.create({
        data: {
          productId,
          governmentChallanNo,
          initialBagsCount: bagsCount,
          currentBagsCount: bagsCount,
          baseCostPerBagPoisha,
          logisticsCostPoisha: totalLogisticsCostPoisha,
          landedCostPerBagPoisha,
        },
      });

      // 2. Create JournalEntry with balanced LedgerLines
      const journalEntry = await tx.journalEntry.create({
        data: {
          referenceNo: governmentChallanNo,
          description: `Procurement intake — ${product.name} ${bagsCount} bags @ ৳${(landedCostPerBagPoisha / 100).toFixed(0)}/bag (Challan: ${governmentChallanNo})`,
          lines: {
            create: [
              // DR Inventory Asset 1200
              {
                accountId: inventoryAccount.id,
                debitPoisha: totalLandedPoisha,
                creditPoisha: 0,
              },
              // CR Cash/Bank 1100  or  Accounts Payable 2100
              {
                accountId: creditAccount.id,
                debitPoisha: 0,
                creditPoisha: totalLandedPoisha,
              },
            ],
          },
        },
      });

      // 3. Create StockTransaction (STOCK_INFLOW) linked to the journal entry
      await tx.stockTransaction.create({
        data: {
          type: "STOCK_INFLOW",
          productId,
          batchId: batch.id,
          bagsCount,
          description: `Government depot receipt. Challan: ${governmentChallanNo}`,
          journalEntryId: journalEntry.id,
        },
      });

      return { batch, landedCostPerBagPoisha };
    });

    revalidatePath("/procurement");

    return {
      status: "success",
      message: `Batch recorded. Landed cost: ৳${(result.landedCostPerBagPoisha / 100).toFixed(2)}/bag.`,
      batchId: result.batch.id,
      landedCostPerBagPoisha: result.landedCostPerBagPoisha,
    };
  } catch (err) {
    console.error("[procurement] logProcurementIntake error:", err);
    const message =
      err instanceof Error && err.message.includes("No Account found")
        ? "Chart of accounts not seeded. Run `npm run db:seed` first."
        : err instanceof Error && err.message.includes("No Product found")
          ? "Selected product not found in database."
          : "Failed to record intake. Please try again.";
    return { status: "error", message };
  }
}
