"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { toPoisha } from "@/lib/currency";

export type PaymentFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function recordRetailerPayment(
  prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const retailerId = String(formData.get("retailerId") ?? "").trim();
  const amountTaka = parseFloat(String(formData.get("amountTaka") ?? ""));
  const note = String(formData.get("note") ?? "").trim();
  // Optional: link this payment to a specific unpaid invoice
  const invoiceId = String(formData.get("invoiceId") ?? "").trim() || null;

  if (!retailerId) return { status: "error", message: "Retailer not specified." };
  if (!Number.isFinite(amountTaka) || amountTaka <= 0)
    return { status: "error", message: "Payment amount must be a positive number." };

  const amountPoisha = toPoisha(amountTaka);

  try {
    await prisma.$transaction(async (tx) => {
      const retailer = await tx.retailer.findUniqueOrThrow({ where: { id: retailerId } });

      if (amountPoisha > retailer.currentBalancePoisha) {
        throw new Error(
          `Payment of ৳${amountTaka.toLocaleString()} exceeds outstanding balance of ৳${(retailer.currentBalancePoisha / 100).toLocaleString()}.`,
        );
      }

      // If an invoice was selected, validate it belongs to this retailer
      if (invoiceId) {
        const invoice = await tx.salesInvoice.findUnique({ where: { id: invoiceId } });
        if (!invoice || invoice.retailerId !== retailerId) {
          throw new Error("Selected invoice not found for this retailer.");
        }
        if (invoice.isPaid) {
          throw new Error("This invoice is already marked as settled.");
        }
      }

      const [cashAccount, arAccount] = await Promise.all([
        tx.account.findUniqueOrThrow({ where: { code: "1100" } }),
        tx.account.findUniqueOrThrow({ where: { code: "1300" } }),
      ]);

      const payCount = await tx.journalEntry.count({
        where: { referenceNo: { startsWith: "PAY-" } },
      });
      const year = new Date().getFullYear();
      const referenceNo = `PAY-${year}-${String(payCount + 1).padStart(4, "0")}`;

      await tx.journalEntry.create({
        data: {
          referenceNo,
          description: `Payment received from ${retailer.shopName}${note ? ` — ${note}` : ""}`,
          lines: {
            create: [
              { accountId: cashAccount.id, debitPoisha: amountPoisha, creditPoisha: 0 },
              { accountId: arAccount.id,   debitPoisha: 0,            creditPoisha: amountPoisha },
            ],
          },
        },
      });

      await tx.retailer.update({
        where: { id: retailerId },
        data: { currentBalancePoisha: { decrement: amountPoisha } },
      });

      // Mark the linked invoice as paid if its full amount is covered
      if (invoiceId) {
        const invoice = await tx.salesInvoice.findUniqueOrThrow({ where: { id: invoiceId } });
        if (amountPoisha >= invoice.totalAmountPoisha) {
          await tx.salesInvoice.update({
            where: { id: invoiceId },
            data: { isPaid: true },
          });
        }
      }
    });

    revalidatePath("/retailers");
    revalidatePath(`/retailers/${retailerId}`);
    revalidatePath("/sales");
    revalidatePath("/");
    revalidatePath("/ledgers");

    return {
      status: "success",
      message: `Payment of ৳${amountTaka.toLocaleString()} recorded successfully.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[payments] recordRetailerPayment error:", err);
    return { status: "error", message: msg };
  }
}
