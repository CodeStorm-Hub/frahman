"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { recordRetailerPayment, type PaymentFormState } from "@/app/actions/payments";

const initialState: PaymentFormState = { status: "idle", message: "" };

export function RecordPaymentDialog({
  retailerId,
  shopName,
  currentBalancePoisha,
}: {
  retailerId: string;
  shopName: string;
  currentBalancePoisha: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(recordRetailerPayment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      const t = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn("inline-flex h-7 items-center gap-1 rounded-md border border-border bg-transparent px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/50")}>
        <Banknote className="h-3 w-3" />
        Record Payment
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment — {shopName}</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <p className="text-muted-foreground">Outstanding Balance</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
            {formatTaka(currentBalancePoisha)}
          </p>
        </div>

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
          <input type="hidden" name="retailerId" value={retailerId} />

          <div className="space-y-1.5">
            <Label htmlFor="amountTaka">Payment Amount (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="amountTaka"
                name="amountTaka"
                type="number"
                min="1"
                step="0.01"
                max={currentBalancePoisha / 100}
                placeholder="0"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="e.g. Cash received, Bank transfer" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending || currentBalancePoisha === 0}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isPending ? "Recording…" : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
