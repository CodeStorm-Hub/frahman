"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logStockAdjustment, type AdjustmentFormState } from "@/app/actions/stockAdjustment";

export type AdjustmentBatch = {
  id: string;
  governmentChallanNo: string;
  currentBagsCount: number;
  landedCostPerBagPoisha: number;
  product: { name: string };
};

const initial: AdjustmentFormState = { status: "idle", message: "" };

export function StockAdjustmentDialog({ batches }: { batches: AdjustmentBatch[] }) {
  const [open, setOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [state, formAction, isPending] = useActionState(logStockAdjustment, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      const t = setTimeout(() => {
        setOpen(false);
        setSelectedBatchId("");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [state.status, state.message]);

  const activeBatches = batches.filter((b) => b.currentBagsCount > 0);
  const selectedBatch = activeBatches.find((b) => b.id === selectedBatchId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
        Write Off Stock
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Write-Off Adjustment</DialogTitle>
        </DialogHeader>

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
          {/* Pass the controlled batch selection as a hidden input */}
          <input type="hidden" name="batchId" value={selectedBatchId} />

          <div className="space-y-1.5">
            <Label htmlFor="batch-select">Batch</Label>
            {activeBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No batches with remaining stock.</p>
            ) : (
              <Select
                value={selectedBatchId}
                onValueChange={(v) => setSelectedBatchId(v ?? "")}
              >
                <SelectTrigger id="batch-select" className="w-full">
                  <SelectValue placeholder="Select a batch…">
                    {selectedBatch
                      ? `${selectedBatch.product.name} — ${selectedBatch.governmentChallanNo} (${selectedBatch.currentBagsCount} bags)`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="font-medium">{b.product.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {b.governmentChallanNo} · {b.currentBagsCount} bags
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedBatch && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
              Available stock:{" "}
              <span className="font-semibold text-foreground">
                {selectedBatch.currentBagsCount} bags
              </span>{" "}
              · Write-off value:{" "}
              <span className="font-semibold text-amber-400">
                ৳{(selectedBatch.landedCostPerBagPoisha / 100).toLocaleString("en-BD")}/bag
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="bags-count">Bags to Write Off</Label>
            <Input
              id="bags-count"
              name="bagsCount"
              type="number"
              min={1}
              max={selectedBatch?.currentBagsCount}
              placeholder="e.g. 5"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-description">Reason</Label>
            <Input
              id="adj-description"
              name="description"
              placeholder="e.g. Water-damaged bags, torn packaging"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={isPending || !selectedBatchId || activeBatches.length === 0}
            >
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isPending ? "Recording…" : "Log Write-Off"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
