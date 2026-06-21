"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { updateProduct, type ProductFormState } from "@/app/actions/products";

const initialState: ProductFormState = { status: "idle", message: "" };

export type EditableProduct = {
  id: string;
  name: string;
  chemicalSpec: string;
  officialRatePerBag: number;
};

export function EditProductDialog({ product }: { product: EditableProduct }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateProduct, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Product — {product.name}</DialogTitle>
        </DialogHeader>

        {state.status !== "idle" && (
          <div className={cn(
            "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm",
            state.status === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/25 bg-red-500/10 text-red-400",
          )}>
            {state.status === "success"
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{state.message}</span>
          </div>
        )}

        <form id="edit-product-form" action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={product.id} />

          <div className="space-y-1.5">
            <Label htmlFor="edit-prod-name">Product Name</Label>
            <Input
              id="edit-prod-name"
              name="name"
              defaultValue={product.name}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-prod-spec">Chemical Specification</Label>
            <Input
              id="edit-prod-spec"
              name="chemicalSpec"
              defaultValue={product.chemicalSpec}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-prod-rate">Govt. Rate / 50 kg Bag (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="edit-prod-rate"
                name="officialRateTaka"
                type="number"
                min="1"
                step="0.01"
                defaultValue={product.officialRatePerBag / 100}
                className="pl-7"
                required
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-product-form" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
