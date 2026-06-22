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
  const shopName = String(formData.get("shopName") ?? "").trim();
  const proprietorName = String(formData.get("proprietorName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const creditLimitTaka = parseFloat(String(formData.get("creditLimitTaka") ?? ""));

  if (!shopName) return { status: "error", message: "Shop name is required." };
  if (!proprietorName) return { status: "error", message: "Proprietor name is required." };
  if (!phone) return { status: "error", message: "Phone number is required." };
  if (!address) return { status: "error", message: "Address is required." };
  if (!Number.isFinite(creditLimitTaka) || creditLimitTaka <= 0)
    return { status: "error", message: "Credit limit must be a positive amount." };

  const tradeLicenseNo = String(formData.get("tradeLicenseNo") ?? "").trim() || null;
  const tradeLicenseExpiry = String(formData.get("tradeLicenseExpiry") ?? "").trim();
  const isVerified = formData.get("isVerified") === "on";

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
        tradeLicenseNo,
        tradeLicenseExpiry: tradeLicenseExpiry ? new Date(tradeLicenseExpiry) : null,
        isVerified,
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

export type UpdateRetailerFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateRetailer(
  prevState: UpdateRetailerFormState,
  formData: FormData,
): Promise<UpdateRetailerFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const shopName = String(formData.get("shopName") ?? "").trim();
  const proprietorName = String(formData.get("proprietorName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const creditLimitTaka = parseFloat(String(formData.get("creditLimitTaka") ?? ""));

  if (!id) return { status: "error", message: "Retailer ID missing." };
  if (!shopName) return { status: "error", message: "Shop name is required." };
  if (!proprietorName) return { status: "error", message: "Proprietor name is required." };
  if (!phone) return { status: "error", message: "Phone number is required." };
  if (!address) return { status: "error", message: "Address is required." };
  if (!Number.isFinite(creditLimitTaka) || creditLimitTaka <= 0)
    return { status: "error", message: "Credit limit must be a positive amount." };

  try {
    const retailer = await prisma.retailer.findUniqueOrThrow({ where: { id } });

    const newLimit = toPoisha(creditLimitTaka);
    if (newLimit < retailer.currentBalancePoisha) {
      return {
        status: "error",
        message: `New credit limit ৳${creditLimitTaka.toLocaleString()} is below current outstanding balance ৳${(retailer.currentBalancePoisha / 100).toLocaleString()}. Clear balance first.`,
      };
    }

    const tradeLicenseNo = String(formData.get("tradeLicenseNo") ?? "").trim() || null;
    const tradeLicenseExpiry = String(formData.get("tradeLicenseExpiry") ?? "").trim();
    const isVerified = formData.get("isVerified") === "on";

    await prisma.retailer.update({
      where: { id },
      data: {
        shopName, proprietorName, phone, address, creditLimitPoisha: newLimit,
        tradeLicenseNo,
        tradeLicenseExpiry: tradeLicenseExpiry ? new Date(tradeLicenseExpiry) : null,
        isVerified,
      },
    });

    revalidatePath("/retailers");
    revalidatePath("/sales/new");
    return { status: "success", message: `${shopName} updated successfully.` };
  } catch (err) {
    const isDuplicate = err instanceof Error && err.message.includes("Unique constraint");
    return {
      status: "error",
      message: isDuplicate
        ? `Phone number ${phone} is already registered to another retailer.`
        : "Failed to update retailer. Please try again.",
    };
  }
}

export async function deleteRetailer(
  prevState: UpdateRetailerFormState,
  formData: FormData,
): Promise<UpdateRetailerFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Retailer ID missing." };

  const retailer = await prisma.retailer.findUnique({
    where: { id },
    select: { shopName: true, _count: { select: { invoices: true } } },
  });
  if (!retailer) return { status: "error", message: "Retailer not found." };

  if (retailer._count.invoices > 0) {
    return {
      status: "error",
      message: `"${retailer.shopName}" has invoice history and can't be deleted — suspend the account instead to block new sales.`,
    };
  }

  await prisma.retailer.delete({ where: { id } });

  revalidatePath("/retailers");
  revalidatePath("/sales/new");
  return { status: "success", message: `"${retailer.shopName}" deleted.` };
}

export async function toggleRetailerAuthorization(
  prevState: UpdateRetailerFormState,
  formData: FormData,
): Promise<UpdateRetailerFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Retailer ID missing." };

  try {
    const retailer = await prisma.retailer.findUniqueOrThrow({ where: { id } });
    const newStatus = !retailer.isAuthorized;
    await prisma.retailer.update({ where: { id }, data: { isAuthorized: newStatus } });

    revalidatePath("/retailers");
    revalidatePath("/sales/new");
    return {
      status: "success",
      message: `${retailer.shopName} ${newStatus ? "authorized" : "suspended"}.`,
    };
  } catch {
    return { status: "error", message: "Failed to update retailer status." };
  }
}
