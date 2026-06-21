"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
import { createProduct, type ProductFormState } from "@/app/actions/products";

const initialState: ProductFormState = { status: "idle", message: "" };

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createProduct, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
        "transition-colors hover:bg-primary/90",
      )}>
        <Plus className="h-4 w-4" />
        Add Product
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
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

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Product Name</Label>
            <Input
              id="add-name"
              name="name"
              placeholder="e.g. Urea"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-spec">Chemical Specification</Label>
            <Input
              id="add-spec"
              name="chemicalSpec"
              placeholder="e.g. 46% Nitrogen"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-rate">Govt. Rate / 50 kg Bag (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="add-rate"
                name="officialRateTaka"
                type="number"
                min="1"
                step="0.01"
                placeholder="0"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isPending ? "Adding…" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
