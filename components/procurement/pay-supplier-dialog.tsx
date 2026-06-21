"use client";

import { useActionState, useEffect, useState } from "react";
import { Banknote, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
import { formatTaka } from "@/lib/currency";
import {
  recordSupplierPayment,
  type SupplierPaymentFormState,
} from "@/app/actions/supplierPayments";

const initialState: SupplierPaymentFormState = { status: "idle", message: "" };

export function PaySupplierDialog({ apBalancePoisha }: { apBalancePoisha: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(recordSupplierPayment, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={apBalancePoisha === 0}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Banknote className="h-4 w-4" />
        Pay Supplier
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Supplier Payment</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <p className="text-muted-foreground">Outstanding Payables (AP)</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
            {formatTaka(apBalancePoisha)}
          </p>
        </div>

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
            <Label htmlFor="sup-amount">Payment Amount (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="sup-amount"
                name="amountTaka"
                type="number"
                min="1"
                step="0.01"
                max={apBalancePoisha / 100}
                placeholder="0"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sup-note">Note (optional)</Label>
            <Input id="sup-note" name="note" placeholder="e.g. BADC October settlement" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isPending ? "Recording…" : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
