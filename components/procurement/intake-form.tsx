"use client";

import { useActionState, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  logProcurementIntake,
  type ProcurementFormState,
} from "@/app/actions/procurement";

type Product = { id: string; name: string; chemicalSpec: string; officialRatePerBag: number };

const initialState: ProcurementFormState = { status: "idle", message: "" };

export function ProcurementIntakeForm({ products }: { products: Product[] }) {
  const [state, formAction, isPending] = useActionState(logProcurementIntake, initialState);

  // Controlled fields for the live cost preview
  const [selectedProductId, setSelectedProductId] = useState("");
  const [bagsCount, setBagsCount] = useState("");
  const [transportFee, setTransportFee] = useState("");
  const [coolieFee, setCoolieFee] = useState("");
  const [creditAccountCode, setCreditAccountCode] = useState("2100");

  // Reset form fields on success
  useEffect(() => {
    if (state.status === "success") {
      setSelectedProductId("");
      setBagsCount("");
      setTransportFee("");
      setCoolieFee("");
      setCreditAccountCode("2100");
    }
  }, [state.status, state.batchId]);

  // Live cost preview
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const bags = parseInt(bagsCount, 10);
  const transport = parseFloat(transportFee) || 0;
  const coolie = parseFloat(coolieFee) || 0;

  let preview: { baseCost: number; logisticsCost: number; landedCost: number; total: number } | null = null;
  if (selectedProduct && bags > 0) {
    const baseCostPerBag = selectedProduct.officialRatePerBag / 100; // Taka
    const totalLogistics = transport + coolie;
    const logisticsPerBag = totalLogistics / bags;
    const landedPerBag = baseCostPerBag + logisticsPerBag;
    preview = {
      baseCost: baseCostPerBag,
      logisticsCost: logisticsPerBag,
      landedCost: landedPerBag,
      total: landedPerBag * bags,
    };
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Log Incoming Shipment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status banner */}
        {state.status !== "idle" && (
          <div
            className={cn(
              "mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
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

        <form action={formAction} className="space-y-5">
          {/* Hidden controlled field values passed as hidden inputs */}
          <input type="hidden" name="productId" value={selectedProductId} />
          <input type="hidden" name="creditAccountCode" value={creditAccountCode} />

          {/* Row 1: Product + Bags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-select">Product</Label>
              <Select
                value={selectedProductId}
                onValueChange={(v) => setSelectedProductId(v ?? "")}
              >
                <SelectTrigger id="product-select" className="w-full">
                  <SelectValue placeholder="Select fertilizer…">
                    {selectedProduct
                      ? `${selectedProduct.name} — ${selectedProduct.chemicalSpec}`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {p.chemicalSpec}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bagsCount">Bags Received (50 kg)</Label>
              <Input
                id="bagsCount"
                name="bagsCount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 500"
                value={bagsCount}
                onChange={(e) => setBagsCount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Challan No */}
          <div className="space-y-1.5">
            <Label htmlFor="governmentChallanNo">Government Challan No.</Label>
            <Input
              id="governmentChallanNo"
              name="governmentChallanNo"
              placeholder="e.g. BADC-2026-00183"
              required
            />
          </div>

          {/* Row 3: Logistics fees */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transportTruckFeeTaka">Transport Truck Fee (৳)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="transportTruckFeeTaka"
                  name="transportTruckFeeTaka"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={transportFee}
                  onChange={(e) => setTransportFee(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coolieLaborFeeTaka">Coolie Labor Fee (৳)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="coolieLaborFeeTaka"
                  name="coolieLaborFeeTaka"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={coolieFee}
                  onChange={(e) => setCoolieFee(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 4: Credit account */}
          <div className="space-y-1.5">
            <Label htmlFor="credit-account-select">Payment Method</Label>
            <Select value={creditAccountCode} onValueChange={(v) => setCreditAccountCode(v ?? "2100")}>
              <SelectTrigger id="credit-account-select" className="w-full">
                <SelectValue>
                  {creditAccountCode === "1100"
                    ? "Cash & Bank (1100) — paid immediately"
                    : "Accounts Payable (2100) — paid on credit"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2100">
                  Accounts Payable (2100) — paid on credit
                </SelectItem>
                <SelectItem value="1100">
                  Cash &amp; Bank (1100) — paid immediately
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Live cost preview */}
          {preview && (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calculator className="h-3.5 w-3.5" />
                Landed Cost Preview
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base rate / bag</span>
                  <span className="tabular-nums">৳{preview.baseCost.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logistics / bag</span>
                  <span className="tabular-nums">৳{preview.logisticsCost.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="my-1 border-t border-border" />
                <div className="flex justify-between font-semibold">
                  <span>Landed cost / bag</span>
                  <span className="tabular-nums text-emerald-400">
                    ৳{preview.landedCost.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total batch value ({bags.toLocaleString()} bags)</span>
                  <span className="tabular-nums">৳{preview.total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !selectedProductId}
            className="w-full sm:w-auto"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Recording…" : "Submit Intake"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
