"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Banknote, CheckCircle2, AlertCircle, Loader2, Receipt } from "lucide-react";
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

export type UnpaidInvoice = {
  id: string;
  invoiceNo: string;
  totalAmountPoisha: number;
};

export function RecordPaymentDialog({
  retailerId,
  shopName,
  currentBalancePoisha,
  unpaidInvoices = [],
}: {
  retailerId: string;
  shopName: string;
  currentBalancePoisha: number;
  unpaidInvoices?: UnpaidInvoice[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(recordRetailerPayment, initialState);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-fill amount when an invoice is selected
  const selectedInvoice = unpaidInvoices.find((i) => i.id === selectedInvoiceId);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setSelectedInvoiceId("");
      const t = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) setSelectedInvoiceId("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border border-border bg-transparent px-2",
        "text-xs font-medium text-foreground transition-colors hover:bg-muted/50",
      )}>
        <Banknote className="h-3 w-3" />
        Record Payment
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment — {shopName}</DialogTitle>
        </DialogHeader>

        {/* Outstanding balance */}
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <p className="text-muted-foreground">Outstanding Balance</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
            {formatTaka(currentBalancePoisha)}
          </p>
        </div>

        {/* Status message */}
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

        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="retailerId" value={retailerId} />
          <input type="hidden" name="invoiceId" value={selectedInvoiceId} />

          {/* Invoice selector */}
          {unpaidInvoices.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Apply to Invoice (optional)
              </Label>
              <div className="max-h-36 overflow-y-auto rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId("")}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted/40",
                    !selectedInvoiceId ? "bg-muted/60 font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  General payment (no specific invoice)
                </button>
                {unpaidInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={cn(
                      "flex w-full items-center justify-between border-t border-border/50 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/40",
                      selectedInvoiceId === inv.id
                        ? "bg-muted/60 font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="font-mono">{inv.invoiceNo}</span>
                    <span className="tabular-nums">{formatTaka(inv.totalAmountPoisha)}</span>
                  </button>
                ))}
              </div>
              {selectedInvoice && (
                <p className="text-[11px] text-emerald-400">
                  Invoice will be marked Settled when payment ≥ {formatTaka(selectedInvoice.totalAmountPoisha)}
                </p>
              )}
            </div>
          )}

          {/* Amount */}
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
                placeholder={selectedInvoice ? String(selectedInvoice.totalAmountPoisha / 100) : "0"}
                defaultValue={selectedInvoice ? selectedInvoice.totalAmountPoisha / 100 : undefined}
                key={selectedInvoiceId} // re-mount to update defaultValue
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="e.g. Cash received, Bank transfer" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
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
