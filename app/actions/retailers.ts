"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { toPoisha } from "@/lib/currency";

export type RetailerFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function addRetailer(
  prevState: RetailerFormState,
  formData: FormData,
): Promise<RetailerFormState> {
  const shopName = (formData.get("shopName") as string)?.trim();
  const proprietorName = (formData.get("proprietorName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const creditLimitTaka = parseFloat(formData.get("creditLimitTaka") as string);

  if (!shopName) return { status: "error", message: "Shop name is required." };
  if (!proprietorName) return { status: "error", message: "Proprietor name is required." };
  if (!phone) return { status: "error", message: "Phone number is required." };
  if (!address) return { status: "error", message: "Address is required." };
  if (isNaN(creditLimitTaka) || creditLimitTaka <= 0)
    return { status: "error", message: "Credit limit must be a positive amount." };

  try {
    await prisma.retailer.create({
      data: {
        shopName,
        proprietorName,
        phone,
        address,
        creditLimitPoisha: toPoisha(creditLimitTaka),
        currentBalancePoisha: 0,
        isAuthorized: true,
      },
    });

    revalidatePath("/retailers");
    return { status: "success", message: `${shopName} added successfully.` };
  } catch (err) {
    const isDuplicate =
      err instanceof Error && err.message.includes("Unique constraint");
    return {
      status: "error",
      message: isDuplicate
        ? `Phone number ${phone} is already registered.`
        : "Failed to add retailer. Please try again.",
    };
  }
}
