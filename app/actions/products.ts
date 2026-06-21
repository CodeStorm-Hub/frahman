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
