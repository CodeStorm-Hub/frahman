"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { toPoisha } from "@/lib/currency";

export type ProductFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const chemicalSpec = formData.get("chemicalSpec")?.toString().trim() ?? "";
  const officialRateTaka = parseFloat(formData.get("officialRateTaka")?.toString() ?? "0");

  if (!name || !chemicalSpec || officialRateTaka <= 0) {
    return { status: "error", message: "All fields are required and rate must be positive." };
  }

  const existing = await prisma.product.findUnique({ where: { name } });
  if (existing) {
    return { status: "error", message: `A product named "${name}" already exists.` };
  }

  await prisma.product.create({
    data: {
      name,
      chemicalSpec,
      officialRatePerBag: toPoisha(officialRateTaka),
    },
  });

  revalidatePath("/products");
  revalidatePath("/procurement");
  revalidatePath("/sales/new");
  return { status: "success", message: `Product "${name}" added successfully.` };
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = formData.get("id")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const chemicalSpec = formData.get("chemicalSpec")?.toString().trim() ?? "";
  const officialRateTaka = parseFloat(formData.get("officialRateTaka")?.toString() ?? "0");

  if (!id || !name || !chemicalSpec || officialRateTaka <= 0) {
    return { status: "error", message: "All fields are required and rate must be positive." };
  }

  const conflict = await prisma.product.findFirst({
    where: { name, NOT: { id } },
  });
  if (conflict) {
    return { status: "error", message: `Another product named "${name}" already exists.` };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      chemicalSpec,
      officialRatePerBag: toPoisha(officialRateTaka),
    },
  });

  revalidatePath("/products");
  revalidatePath("/procurement");
  revalidatePath("/sales/new");
  return { status: "success", message: `Product "${name}" updated.` };
}

export async function deleteProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = formData.get("id")?.toString() ?? "";
  if (!id) return { status: "error", message: "Product ID missing." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      _count: { select: { batches: true, stockTransactions: true, salesLines: true } },
    },
  });
  if (!product) return { status: "error", message: "Product not found." };

  const { batches, stockTransactions, salesLines } = product._count;
  if (batches > 0 || stockTransactions > 0 || salesLines > 0) {
    return {
      status: "error",
      message: `"${product.name}" has procurement, stock, or sales history and can't be deleted — it would break the audit trail.`,
    };
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/products");
  revalidatePath("/procurement");
  revalidatePath("/sales/new");
  return { status: "success", message: `Product "${product.name}" deleted.` };
}
