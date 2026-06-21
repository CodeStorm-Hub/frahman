"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, CheckCircle2, AlertCircle, Loader2, ShieldOff, ShieldCheck } from "lucide-react";
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
import {
  updateRetailer,
  toggleRetailerAuthorization,
  type UpdateRetailerFormState,
} from "@/app/actions/retailers";

const initialState: UpdateRetailerFormState = { status: "idle", message: "" };

export type EditableRetailer = {
  id: string;
  shopName: string;
  proprietorName: string;
  phone: string;
  address: string;
  creditLimitPoisha: number;
  isAuthorized: boolean;
};

export function EditRetailerDialog({ retailer }: { retailer: EditableRetailer }) {
  const [open, setOpen] = useState(false);
  const [updateState, updateAction, isUpdatePending] = useActionState(updateRetailer, initialState);
  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleRetailerAuthorization,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const activeState = updateState.status !== "idle" ? updateState : toggleState;

  useEffect(() => {
    if (updateState.status === "success") {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [updateState.status, updateState.message]);

  useEffect(() => {
    if (toggleState.status === "success") {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [toggleState.status, toggleState.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Retailer — {retailer.shopName}</DialogTitle>
        </DialogHeader>

        {activeState.status !== "idle" && (
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm",
              activeState.status === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/25 bg-red-500/10 text-red-400",
            )}
          >
            {activeState.status === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{activeState.message}</span>
          </div>
        )}

        {/* Update form — fields only, no footer buttons inside */}
        <form ref={formRef} id="edit-retailer-form" action={updateAction} className="space-y-4">
          <input type="hidden" name="id" value={retailer.id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-shopName">Shop / Business Name</Label>
              <Input
                id="edit-shopName"
                name="shopName"
                defaultValue={retailer.shopName}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-proprietorName">Proprietor Name</Label>
              <Input
                id="edit-proprietorName"
                name="proprietorName"
                defaultValue={retailer.proprietorName}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              name="phone"
              type="tel"
              defaultValue={retailer.phone}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              name="address"
              defaultValue={retailer.address}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-creditLimit">Credit Limit (৳)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <Input
                id="edit-creditLimit"
                name="creditLimitTaka"
                type="number"
                min="1000"
                step="500"
                defaultValue={retailer.creditLimitPoisha / 100}
                className="pl-7"
                required
              />
            </div>
          </div>
        </form>

        {/* Footer row — authorization toggle form + save/cancel, both siblings of the update form above */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <form action={toggleAction}>
            <input type="hidden" name="id" value={retailer.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isTogglePending}
              className={cn(
                "gap-1.5 text-xs",
                retailer.isAuthorized
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
              )}
            >
              {isTogglePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : retailer.isAuthorized ? (
                <ShieldOff className="h-3.5 w-3.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {retailer.isAuthorized ? "Suspend Retailer" : "Re-authorize"}
            </Button>
          </form>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {/* form attr links this button to #edit-retailer-form even though it's outside it */}
            <Button type="submit" form="edit-retailer-form" size="sm" disabled={isUpdatePending}>
              {isUpdatePending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isUpdatePending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
