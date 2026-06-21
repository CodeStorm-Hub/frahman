"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { toPoisha } from "@/lib/currency";

export type SupplierPaymentFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function recordSupplierPayment(
  _prev: SupplierPaymentFormState,
  formData: FormData,
): Promise<SupplierPaymentFormState> {
  const amountTaka = parseFloat(formData.get("amountTaka")?.toString() ?? "0");
  const note = formData.get("note")?.toString().trim() ?? "";

  if (!amountTaka || amountTaka <= 0) {
    return { status: "error", message: "Amount must be greater than zero." };
  }

  const amountPoisha = toPoisha(amountTaka);

  await prisma.$transaction(async (tx) => {
    const [cashAccount, apAccount] = await Promise.all([
      tx.account.findUniqueOrThrow({ where: { code: "1100" } }),
      tx.account.findUniqueOrThrow({ where: { code: "2100" } }),
    ]);

    const apBalance = await tx.ledgerLine.aggregate({
      _sum: { debitPoisha: true, creditPoisha: true },
      where: { accountId: apAccount.id },
    });
    const currentAP =
      (apBalance._sum.creditPoisha ?? 0) - (apBalance._sum.debitPoisha ?? 0);

    if (amountPoisha > currentAP) {
      throw new Error(
        `Payment (৳${amountTaka.toLocaleString("en-BD")}) exceeds outstanding payables balance.`,
      );
    }

    const payCount = await tx.journalEntry.count({
      where: { referenceNo: { startsWith: "SUP-" } },
    });
    const year = new Date().getFullYear();
    const referenceNo = `SUP-${year}-${String(payCount + 1).padStart(4, "0")}`;

    await tx.journalEntry.create({
      data: {
        referenceNo,
        description: note
          ? `Supplier payment — ${note}`
          : "Supplier payment — AP settlement",
        lines: {
          create: [
            { accountId: apAccount.id,   debitPoisha: amountPoisha, creditPoisha: 0             },
            { accountId: cashAccount.id, debitPoisha: 0,            creditPoisha: amountPoisha  },
          ],
        },
      },
    });
  });

  revalidatePath("/procurement");
  revalidatePath("/ledgers");
  revalidatePath("/accounting");
  revalidatePath("/");
  return { status: "success", message: `Payment recorded successfully.` };
}
