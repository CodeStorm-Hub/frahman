"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addRetailer, type RetailerFormState } from "@/app/actions/retailers";
import { useState } from "react";

const initialState: RetailerFormState = { status: "idle", message: "" };

export function AddRetailerDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addRetailer, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      // Close dialog after brief success display
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
      >
        <Plus className="h-4 w-4" />
        Add Retailer
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Retailer</DialogTitle>
        </DialogHeader>

        {/* Status banner */}
        {state.status !== "idle" && (
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm",
              state.status === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/25 bg-red-500/10 text-red-400",
            )}
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shopName">Shop / Business Name</Label>
              <Input id="shopName" name="shopName" placeholder="e.g. Rahman Agro Store" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proprietorName">Proprietor Name</Label>
              <Input id="proprietorName" name="proprietorName" placeholder="e.g. Md. Rahman" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="e.g. 01711-123456" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="e.g. South Bazar, Pirojpur" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="creditLimitTaka">Credit Limit (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="creditLimitTaka"
                name="creditLimitTaka"
                type="number"
                min="1000"
                step="500"
                placeholder="50000"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tradeLicenseNo">Trade License No. <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="tradeLicenseNo" name="tradeLicenseNo" placeholder="e.g. TL-2024-00123" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tradeLicenseExpiry">License Expiry <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="tradeLicenseExpiry" name="tradeLicenseExpiry" type="date" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isVerified" name="isVerified" className="h-4 w-4 rounded border-border" />
            <Label htmlFor="isVerified" className="cursor-pointer font-normal">Mark as verified dealer</Label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isPending ? "Saving…" : "Register Retailer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
