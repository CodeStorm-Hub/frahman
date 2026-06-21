"use client";

import { useActionState, useState, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTaka } from "@/lib/currency";
import { createSalesInvoice, type SalesFormState } from "@/app/actions/sales";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductOption = {
  id: string;
  name: string;
  chemicalSpec: string;
  officialRatePerBag: number; // Poisha
  availableBags: number;
};

export type RetailerOption = {
  id: string;
  shopName: string;
  proprietorName: string;
  creditLimitPoisha: number;
  currentBalancePoisha: number;
  isAuthorized: boolean;
};

type LineItem = {
  key: number;
  productId: string;
  bagsCount: string; // string to allow empty input
  pricePerBagPoisha: number; // editable, defaults to officialRate
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState: SalesFormState = { status: "idle", message: "" };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SaleBuilder({
  products,
  retailers,
  preselectedRetailerId,
}: {
  products: ProductOption[];
  retailers: RetailerOption[];
  preselectedRetailerId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createSalesInvoice, initialState);
  const nextKeyRef = useRef(0);

  const [retailerId, setRetailerId] = useState(preselectedRetailerId ?? "");
  const [lines, setLines] = useState<LineItem[]>([
    { key: nextKeyRef.current++, productId: "", bagsCount: "", pricePerBagPoisha: 0 },
  ]);
  const [override, setOverride] = useState(false);

  // Re-derive selected retailer from state
  const selectedRetailer = retailers.find((r) => r.id === retailerId) ?? null;

  // -- Line item helpers --

  const updateLine = useCallback(
    (key: number, patch: Partial<LineItem>) => {
      setLines((prev) =>
        prev.map((l) => {
          if (l.key !== key) return l;
          const updated = { ...l, ...patch };
          // When productId changes, reset price to that product's official rate
          if (patch.productId !== undefined && patch.productId !== l.productId) {
            const p = products.find((p) => p.id === patch.productId);
            updated.pricePerBagPoisha = p?.officialRatePerBag ?? 0;
          }
          return updated;
        }),
      );
    },
    [products],
  );

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { key: nextKeyRef.current++, productId: "", bagsCount: "", pricePerBagPoisha: 0 },
    ]);

  const removeLine = (key: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  // -- Calculations --

  const totalInvoicePoisha = lines.reduce((sum, l) => {
    const bags = parseInt(l.bagsCount, 10) || 0;
    return sum + bags * l.pricePerBagPoisha;
  }, 0);

  const projectedBalance = selectedRetailer
    ? selectedRetailer.currentBalancePoisha + totalInvoicePoisha
    : 0;

  const isCreditExceeded =
    selectedRetailer != null &&
    totalInvoicePoisha > 0 &&
    projectedBalance > selectedRetailer.creditLimitPoisha;

  const canSubmit =
    retailerId &&
    lines.every((l) => l.productId && parseInt(l.bagsCount, 10) > 0 && l.pricePerBagPoisha > 0) &&
    (!isCreditExceeded || override) &&
    !isPending;

  // -- Serialise lines for hidden input --
  const linesJson = JSON.stringify(
    lines
      .filter((l) => l.productId && parseInt(l.bagsCount, 10) > 0)
      .map((l) => ({
        productId: l.productId,
        bagsCount: parseInt(l.bagsCount, 10),
        pricePerBagPoisha: l.pricePerBagPoisha,
      })),
  );

  // Used product IDs (to exclude from subsequent line dropdowns)
  const usedProductIds = lines.map((l) => l.productId).filter(Boolean);

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden serialised inputs */}
      <input type="hidden" name="retailerId" value={retailerId} />
      <input type="hidden" name="linesJson" value={linesJson} />
      <input type="hidden" name="override" value={override ? "true" : "false"} />

      {/* Status banner */}
      {state.status === "success" && state.invoiceNo && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-400">Invoice Created Successfully</p>
              <div className="mt-1.5 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400/70" />
                <span className="font-mono text-lg font-bold tracking-wide text-emerald-300">
                  {state.invoiceNo}
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-400/70">{state.message}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-emerald-500/20 pt-4">
            <Link
              href="/retailers"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10")}
            >
              Back to Retailers
            </Link>
            <Link
              href="/sales"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10")}
            >
              Invoice History
            </Link>
            <Link
              href="/ledgers"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10")}
            >
              View Ledger
            </Link>
          </div>
        </div>
      )}
      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* ── Section 1: Retailer Selection ── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Select Retailer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Retailer</Label>
            <Select
              value={retailerId}
              onValueChange={(v) => { setRetailerId(v ?? ""); setOverride(false); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a retailer…">
                  {selectedRetailer
                    ? `${selectedRetailer.shopName} — ${selectedRetailer.proprietorName}`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {retailers.map((r) => (
                  <SelectItem key={r.id} value={r.id} disabled={!r.isAuthorized}>
                    <span className="font-medium">{r.shopName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {r.proprietorName}
                      {!r.isAuthorized && " · Suspended"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Retailer credit snapshot */}
          {selectedRetailer && (
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/20 p-3 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Outstanding</p>
                <p className="mt-0.5 tabular-nums font-semibold text-foreground">
                  {formatTaka(selectedRetailer.currentBalancePoisha)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Credit Limit</p>
                <p className="mt-0.5 tabular-nums font-semibold text-foreground">
                  {formatTaka(selectedRetailer.creditLimitPoisha)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p
                  className={cn(
                    "mt-0.5 tabular-nums font-semibold",
                    selectedRetailer.creditLimitPoisha - selectedRetailer.currentBalancePoisha <= 0
                      ? "text-red-400"
                      : "text-emerald-400",
                  )}
                >
                  {formatTaka(
                    Math.max(
                      0,
                      selectedRetailer.creditLimitPoisha - selectedRetailer.currentBalancePoisha,
                    ),
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Order Lines ── */}
      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Order Lines</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={addLine}
            disabled={lines.length >= products.length}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Line
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Column headers */}
          <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-medium text-muted-foreground sm:grid">
            <span>Product</span>
            <span className="w-24 text-right">Bags</span>
            <span className="w-32 text-right">Price / bag</span>
            <span className="w-20 text-right">Line Total</span>
          </div>

          {lines.map((line) => {
            const bags = parseInt(line.bagsCount, 10) || 0;
            const lineTotal = bags * line.pricePerBagPoisha;
            const product = products.find((p) => p.id === line.productId);
            const insufficientStock = product && bags > product.availableBags;

            return (
              <div
                key={line.key}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  insufficientStock ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/10",
                )}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                  {/* Product */}
                  <Select
                    value={line.productId}
                    onValueChange={(v) => updateLine(line.key, { productId: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product…">
                        {product ? `${product.name} — ${product.chemicalSpec}` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => {
                        const taken = usedProductIds.includes(p.id) && line.productId !== p.id;
                        return (
                          <SelectItem key={p.id} value={p.id} disabled={taken}>
                            <span className="font-medium">{p.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {p.availableBags} bags avail.
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Bags */}
                  <div className="flex flex-col gap-1 sm:w-24">
                    <Label className="text-xs text-muted-foreground sm:hidden">Bags</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={line.bagsCount}
                      onChange={(e) => updateLine(line.key, { bagsCount: e.target.value })}
                      className="sm:text-right"
                    />
                  </div>

                  {/* Price/bag */}
                  <div className="flex flex-col gap-1 sm:w-32">
                    <Label className="text-xs text-muted-foreground sm:hidden">Price / bag (৳)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        ৳
                      </span>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="0"
                        value={line.pricePerBagPoisha > 0 ? line.pricePerBagPoisha / 100 : ""}
                        onChange={(e) =>
                          updateLine(line.key, {
                            pricePerBagPoisha: Math.round(parseFloat(e.target.value || "0") * 100),
                          })
                        }
                        className="pl-6 sm:text-right"
                      />
                    </div>
                  </div>

                  {/* Line total + delete */}
                  <div className="flex items-center justify-between gap-2 sm:w-20 sm:flex-col sm:items-end">
                    <span
                      className={cn(
                        "tabular-nums text-sm font-semibold",
                        lineTotal > 0 ? "text-foreground" : "text-muted-foreground/40",
                      )}
                    >
                      {lineTotal > 0 ? formatTaka(lineTotal) : "—"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Stock warning */}
                {insufficientStock && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Only {product?.availableBags} bags in stock
                  </p>
                )}
              </div>
            );
          })}

          {/* Invoice total */}
          {totalInvoicePoisha > 0 && (
            <div className="flex justify-end border-t border-border pt-3">
              <div className="space-y-1 text-right text-sm">
                <div className="flex gap-6">
                  <span className="text-muted-foreground">Invoice Total</span>
                  <span className="w-28 tabular-nums font-bold text-foreground">
                    {formatTaka(totalInvoicePoisha)}
                  </span>
                </div>
                {selectedRetailer && (
                  <div className="flex gap-6">
                    <span className="text-muted-foreground">Projected Balance</span>
                    <span
                      className={cn(
                        "w-28 tabular-nums font-semibold",
                        isCreditExceeded ? "text-red-400" : "text-foreground",
                      )}
                    >
                      {formatTaka(projectedBalance)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Credit Exception Warning ── */}
      {isCreditExceeded && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/8 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-red-400">Credit Limit Exceeded</p>
              <p className="text-xs text-red-400/80">
                This invoice would bring {selectedRetailer?.shopName}&apos;s balance to{" "}
                <strong>{formatTaka(projectedBalance)}</strong>, exceeding their limit of{" "}
                <strong>{formatTaka(selectedRetailer?.creditLimitPoisha ?? 0)}</strong> by{" "}
                <strong>
                  {formatTaka(projectedBalance - (selectedRetailer?.creditLimitPoisha ?? 0))}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Override checkbox */}
          <div className="mt-3 flex items-center gap-2.5 border-t border-red-500/20 pt-3">
            <Checkbox
              id="override"
              checked={override}
              onCheckedChange={(v) => setOverride(v === true)}
              className="border-red-500/50 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
            />
            <label htmlFor="override" className="cursor-pointer text-xs text-red-400">
              I understand the credit risk and authorise this sale as owner override
            </label>
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {canSubmit ? "Ready to generate invoice" : "Complete all fields to proceed"}
        </p>
        <Button type="submit" disabled={!canSubmit} className="min-w-32">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Processing…" : "Confirm Sale"}
        </Button>
      </div>
    </form>
  );
}
