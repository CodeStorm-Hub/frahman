"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export type AdjustmentFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function logStockAdjustment(
  prevState: AdjustmentFormState,
  formData: FormData,
): Promise<AdjustmentFormState> {
  const batchId = String(formData.get("batchId") ?? "").trim();
  const bagsCount = parseInt(String(formData.get("bagsCount") ?? ""), 10);
  const description = String(formData.get("description") ?? "").trim();

  if (!batchId) return { status: "error", message: "Please select a batch." };
  if (!description) return { status: "error", message: "Please provide a reason for the adjustment." };
  if (!Number.isInteger(bagsCount) || bagsCount <= 0)
    return { status: "error", message: "Bags count must be a positive whole number." };

  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.inventoryBatch.findUniqueOrThrow({
        where: { id: batchId },
        include: { product: { select: { id: true, name: true } } },
      });

      if (bagsCount > batch.currentBagsCount) {
        throw new Error(
          `Cannot write off ${bagsCount} bags — only ${batch.currentBagsCount} bags remain in this batch.`,
        );
      }

      const [lossAccount, inventoryAccount] = await Promise.all([
        tx.account.findUniqueOrThrow({ where: { code: "5200" } }),
        tx.account.findUniqueOrThrow({ where: { code: "1200" } }),
      ]);

      const writeoffPoisha = bagsCount * batch.landedCostPerBagPoisha;

      const adjCount = await tx.stockTransaction.count({ where: { type: "STOCK_ADJUSTMENT" } });
      const referenceNo = `ADJ-2026-${String(adjCount + 1).padStart(4, "0")}`;

      const entry = await tx.journalEntry.create({
        data: {
          referenceNo,
          description: `Stock write-off: ${bagsCount} bag(s) of ${batch.product.name} — ${description}`,
          lines: {
            create: [
              { accountId: lossAccount.id,      debitPoisha: writeoffPoisha, creditPoisha: 0            },
              { accountId: inventoryAccount.id,  debitPoisha: 0,             creditPoisha: writeoffPoisha },
            ],
          },
        },
      });

      await tx.inventoryBatch.update({
        where: { id: batchId },
        data: { currentBagsCount: { decrement: bagsCount } },
      });

      await tx.stockTransaction.create({
        data: {
          type: "STOCK_ADJUSTMENT",
          productId: batch.product.id,
          batchId,
          bagsCount,
          description,
          journalEntryId: entry.id,
        },
      });
    });

    revalidatePath("/procurement");
    revalidatePath("/");
    revalidatePath("/ledgers");

    return {
      status: "success",
      message: `Write-off recorded: ${bagsCount} bag(s) logged as inventory loss.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[stockAdjustment] error:", err);
    return { status: "error", message: msg };
  }
}
