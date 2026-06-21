"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export type SaleLineInput = {
  productId: string;
  bagsCount: number;
  pricePerBagPoisha: number;
};

export type SalesFormState = {
  status: "idle" | "success" | "error";
  message: string;
  invoiceNo?: string;
};

export async function createSalesInvoice(
  prevState: SalesFormState,
  formData: FormData,
): Promise<SalesFormState> {
  const retailerId = String(formData.get("retailerId") ?? "").trim();
  // "true" string sent by the client toggle; any other value is false
  const override = formData.get("override") === "true";
  const linesJson = String(formData.get("linesJson") ?? "").trim();

  if (!retailerId) return { status: "error", message: "Please select a retailer." };
  if (!linesJson) return { status: "error", message: "No line items provided." };

  let lines: SaleLineInput[];
  try {
    lines = JSON.parse(linesJson) as SaleLineInput[];
  } catch {
    return { status: "error", message: "Invalid line items." };
  }

  if (!lines.length) return { status: "error", message: "Add at least one product line." };
  if (lines.some((l) => !Number.isInteger(l.bagsCount) || l.bagsCount <= 0))
    return { status: "error", message: "All bag counts must be positive whole numbers." };
  if (lines.some((l) => !Number.isInteger(l.pricePerBagPoisha) || l.pricePerBagPoisha <= 0))
    return { status: "error", message: "All prices must be positive." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const retailer = await tx.retailer.findUniqueOrThrow({
        where: { id: retailerId },
      });

      if (!retailer.isAuthorized) {
        throw new Error("Retailer is not authorized for credit sales.");
      }

      const totalSalePoisha = lines.reduce(
        (s, l) => s + l.bagsCount * l.pricePerBagPoisha,
        0,
      );
      const projectedBalance = retailer.currentBalancePoisha + totalSalePoisha;
      if (projectedBalance > retailer.creditLimitPoisha && !override) {
        throw new Error(
          `CREDIT_EXCEEDED:Credit limit exceeded. Outstanding ৳${(retailer.currentBalancePoisha / 100).toFixed(0)} + Invoice ৳${(totalSalePoisha / 100).toFixed(0)} = ৳${(projectedBalance / 100).toFixed(0)} exceeds limit ৳${(retailer.creditLimitPoisha / 100).toFixed(0)}.`,
        );
      }

      const [arAccount, revenueAccount, cogsAccount, inventoryAccount] =
        await Promise.all([
          tx.account.findUniqueOrThrow({ where: { code: "1300" } }),
          tx.account.findUniqueOrThrow({ where: { code: "4100" } }),
          tx.account.findUniqueOrThrow({ where: { code: "5100" } }),
          tx.account.findUniqueOrThrow({ where: { code: "1200" } }),
        ]);

      // FIFO batch depletion + COGS accumulation
      let totalCOGSPoisha = 0;
      const batchUpdates: Array<{ id: string; currentBagsCount: number }> = [];

      for (const line of lines) {
        const batches = await tx.inventoryBatch.findMany({
          where: { productId: line.productId, currentBagsCount: { gt: 0 } },
          orderBy: { receivedDate: "asc" },
        });

        let remaining = line.bagsCount;
        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(batch.currentBagsCount, remaining);
          totalCOGSPoisha += take * batch.landedCostPerBagPoisha;
          batchUpdates.push({ id: batch.id, currentBagsCount: batch.currentBagsCount - take });
          remaining -= take;
        }

        if (remaining > 0) {
          const product = await tx.product.findUnique({
            where: { id: line.productId },
            select: { name: true },
          });
          throw new Error(
            `STOCK_INSUFFICIENT:Insufficient stock for ${product?.name ?? line.productId}. Need ${line.bagsCount} bags but only ${line.bagsCount - remaining} available.`,
          );
        }
      }

      await Promise.all(
        batchUpdates.map((u) =>
          tx.inventoryBatch.update({
            where: { id: u.id },
            data: { currentBagsCount: u.currentBagsCount },
          }),
        ),
      );

      const lastInvoice = await tx.salesInvoice.findFirst({
        orderBy: { invoiceNo: "desc" },
        select: { invoiceNo: true },
      });
      const nextSeq = lastInvoice
        ? parseInt(lastInvoice.invoiceNo.split("-")[2] ?? "0", 10) + 1
        : 1;
      const invoiceNo = `INV-2026-${String(nextSeq).padStart(4, "0")}`;

      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNo,
          retailerId,
          totalAmountPoisha: totalSalePoisha,
          lines: {
            create: lines.map((l) => ({
              productId: l.productId,
              bagsCount: l.bagsCount,
              pricePerBagPoisha: l.pricePerBagPoisha,
            })),
          },
        },
      });

      await tx.retailer.update({
        where: { id: retailerId },
        data: { currentBalancePoisha: { increment: totalSalePoisha } },
      });

      await tx.journalEntry.create({
        data: {
          referenceNo: invoiceNo,
          description: `Credit sale to ${retailer.shopName} — ${invoiceNo}`,
          salesInvoiceId: invoice.id,
          lines: {
            create: [
              { accountId: arAccount.id,        debitPoisha: totalSalePoisha,  creditPoisha: 0              },
              { accountId: revenueAccount.id,    debitPoisha: 0,               creditPoisha: totalSalePoisha },
              { accountId: cogsAccount.id,       debitPoisha: totalCOGSPoisha, creditPoisha: 0              },
              { accountId: inventoryAccount.id,  debitPoisha: 0,               creditPoisha: totalCOGSPoisha },
            ],
          },
        },
      });

      return invoiceNo;
    });

    revalidatePath("/retailers");
    revalidatePath("/sales/new");
    revalidatePath("/procurement");
    revalidatePath("/");
    revalidatePath("/ledgers");

    return { status: "success", message: `Invoice ${result} created successfully.`, invoiceNo: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.startsWith("CREDIT_EXCEEDED:")) {
      return { status: "error", message: msg.slice("CREDIT_EXCEEDED:".length) };
    }
    if (msg.startsWith("STOCK_INSUFFICIENT:")) {
      return { status: "error", message: msg.slice("STOCK_INSUFFICIENT:".length) };
    }
    console.error("[sales] createSalesInvoice error:", err);
    return { status: "error", message: "Failed to create invoice. Please try again." };
  }
}
