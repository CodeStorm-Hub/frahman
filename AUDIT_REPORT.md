# Frahman & Brothers — Full Application Audit Report

**Date:** 2026-06-22  
**Scope:** Full codebase review against SRS requirements — schema, server actions, pages, UI/UX, and data integrity  
**Method:** Graphify knowledge-graph traversal + full source file review of all routes, actions, and components

---

## Executive Summary

The application has a solid architectural foundation: correct Prisma v7 setup, working FIFO inventory depletion, double-entry journal automation, and a responsive mobile-first shell. However, **two of the six navigation routes display hardcoded fake data** (never touching the database), critical SRS features (payment recording, PDF generation, receivables aging, invoice history) are entirely missing, and several bugs affect data integrity. Priority fixes are marked **[CRITICAL]**, data-quality issues as **[BUG]**, and feature gaps as **[MISSING]**.

---

## 1. Critical Issues — Fake/Broken Pages

### [CRITICAL] `/accounting` page is entirely hardcoded mock data
**File:** [`app/(dashboard)/accounting/page.tsx`](app/(dashboard)/accounting/page.tsx)

The Accounting Ledgers page never queries the database. All KPI cards and the ledger table use static in-file arrays (`balanceSummary`, `ledgerEntries`) with invented numbers ("Ministry of Health PO-2024-034", "Staff Salaries — June 2024") completely unrelated to the actual business. The real general ledger page exists at `/ledgers`. This page should either be replaced with a live P&L/balance-sheet view or removed entirely.

**Impact:** Owner sees completely wrong financial figures on the Accounting screen.

---

### [CRITICAL] `/retailer-matrix` page is entirely hardcoded mock data  
**File:** [`app/(dashboard)/retailer-matrix/page.tsx`](app/(dashboard)/retailer-matrix/page.tsx)

Eight fictional retailers (Rahman Traders, Karim Bros Wholesale, etc.) with invented balances. The stats card shows "23 Active Retailers" hardcoded. The live retailer directory is at `/retailers`. This page is a duplicate placeholder that was never connected to the database.

**Impact:** Two nav items for retailers, one showing real data and one showing fiction. Owner could be misled into business decisions based on fake numbers.

---

### [CRITICAL] Two overlapping accounting nav items
**File:** [`components/layout/nav-config.ts`](components/layout/nav-config.ts)

`navItems` contains both:
- `"Accounting"` → `/accounting` (fake data, non-functional)  
- `"Ledger"` → `/ledgers` (real, live, working)

The nav has **6 items** for a small-screen phone, which is already crowded. Having two accounting entries — one dead — is both confusing and wastes a slot. The `/accounting` route should be rebuilt as a live P&L view and replace `/ledgers`, or `/ledgers` should be renamed "Accounting" and the fake page deleted.

---

## 2. Missing Core Features (Required by SRS)

### [MISSING] No payment recording from retailers
**SRS Reference:** §3.2 — "Outstanding Receivables Aging Table: Real-time collection workspace"

When a `SalesInvoice` is created, `retailer.currentBalancePoisha` is incremented in `sales.ts`. But there is **no server action** to record a retailer payment — no way to ever decrease `currentBalancePoisha` or mark `SalesInvoice.isPaid = true`. The `isPaid` field is permanently `false` for every invoice. Without payment recording, the credit balance grows forever and is never settled.

**Missing pieces:**
- `app/actions/payments.ts` — `recordRetailerPayment()` action (DR 1100 Cash / CR 1300 Accounts Receivable)
- Payment form/dialog on the retailers page or retailer detail page
- `SalesInvoice.isPaid` toggle (or full payment allocation across invoices)

---

### [MISSING] No receivables aging table  
**SRS Reference:** §3.2 — "categorizing outstanding dealer balances by duration (0-15 days, 16-30 days, 30+ days)"

No aging logic exists anywhere in the codebase. The `SalesInvoice.invoiceDate` is recorded but never used to compute overdue days. The retailer-matrix page's "Days Overdue" column exists only in fake static data.

**Missing pieces:**
- Age buckets computed from `invoiceDate` vs today on unpaid invoices
- A UI section on the retailers page or a dedicated "Receivables" sub-page

---

### [MISSING] No invoice history / sales list page  
There is no route showing all past `SalesInvoice` records. After creating an invoice, the user is redirected to `/retailers` and there is no way to look up a previous invoice by number, date, or retailer without going through the general ledger. A `/sales` or `/sales/history` page listing invoices with search and filter is needed.

---

### [MISSING] No supplier payment recording (Accounts Payable settlement)  
When procurement debits Inventory (1200) and credits Accounts Payable (2100), a payable is created. But there is no action to later settle it — no "Pay Supplier" workflow (DR 2100 / CR 1100). The AP balance accumulates indefinitely.

---

### [MISSING] PDF / Challan generation  
**SRS Reference:** §2.1 — "Server-side PDF layout generator (pdfkit) to generate physical distribution challans and delivery invoices"

`pdfkit` is not installed. There is no PDF route, no print button, and no challan generation for procurement or sales. A solo distributor in Pirojpur who needs to hand a paper invoice to a retailer has no output document from the system.

---

### [MISSING] Retailer editing / suspension UI  
**File:** [`app/actions/retailers.ts`](app/actions/retailers.ts)

`retailers.ts` only implements `addRetailer`. There is no `updateRetailer` or `toggleRetailerAuthorization` action. Consequently:
- Credit limits cannot be changed once set
- Phone numbers, addresses, and shop names cannot be corrected
- Retailers cannot be suspended/reactivated via the UI (the `isAuthorized` flag is permanently `true`)

---

### [MISSING] Retailer detail / invoice history page  
No `/retailers/[id]` page exists. Clicking a retailer in the table goes nowhere (only "New Sale" action is available). There is no screen showing a specific retailer's outstanding invoices, payment history, or account statement.

---

### [MISSING] Equity account in Chart of Accounts  
**SRS Reference:** §3.3 — "Equity: Owner's Capital"

The seed file ([`prisma/seed.ts`](prisma/seed.ts)) creates 7 accounts but omits the equity tier (3xxx series). A proper balance sheet requires Assets = Liabilities + Equity. Without an equity account, the chart of accounts is structurally incomplete and owner's capital cannot be represented.

**Missing:** `{ code: "3100", name: "Owner's Capital", category: "EQUITY" }`

---

### [MISSING] Trade license / verification tracking  
**SRS Reference:** §3.2 — "local trade license statuses, and verification tags"

The `Retailer` model has no `tradeLicenseNo`, `tradeLicenseExpiry`, or `isVerified` field. The SRS explicitly calls for tracking these as part of dealer qualification.

---

### [MISSING] `STOCK_OUTFLOW` transactions not recorded during sales  
**File:** [`app/actions/sales.ts`](app/actions/sales.ts) — FIFO block (lines 76–109)

The schema defines `TransactionType.STOCK_OUTFLOW` and `StockTransaction` as "Immutable record of every bag movement in or out of the warehouse." When a sale depletes batches, `inventoryBatch.currentBagsCount` is updated and a journal entry is created, but **no `StockTransaction` record** is created with `type: "STOCK_OUTFLOW"`. The stock transaction log (which should provide a full audit trail) is therefore incomplete — only inflows and adjustments are recorded.

---

## 3. Bugs — Data / Logic Errors

### [BUG] Invoice year hardcoded to "2026"  
**Files:** [`app/actions/sales.ts:119`](app/actions/sales.ts), [`app/actions/stockAdjustment.ts:45`](app/actions/stockAdjustment.ts)

```ts
// sales.ts
const invoiceNo = `INV-2026-${String(nextSeq).padStart(4, "0")}`;

// stockAdjustment.ts
const referenceNo = `ADJ-2026-${String(adjCount + 1).padStart(4, "0")}`;
```

These will generate wrong reference numbers in any other year. Should use `new Date().getFullYear()`.

---

### [BUG] Race condition in invoice sequence numbering  
**File:** [`app/actions/sales.ts:111–118`](app/actions/sales.ts)

The sequence number is derived by reading the highest `invoiceNo` string in a separate `findFirst` query, then creating the new invoice. Two concurrent requests will read the same max value and generate duplicate invoice numbers. For a solo operator this is low risk, but under any network retry scenario (double-tap on mobile) it can create duplicate `INV-xxxx` values. A database sequence (`autoincrement`) or advisory lock should be used instead.

---

### [BUG] Invoice ordering by string field is fragile  
**File:** [`app/actions/sales.ts:111–114`](app/actions/sales.ts)

```ts
const lastInvoice = await tx.salesInvoice.findFirst({
  orderBy: { invoiceNo: "desc" },
```

`invoiceNo` is a `String` field. Sorting `"INV-2026-0010"` vs `"INV-2026-0009"` works alphabetically up to 4-digit padding, but breaks immediately if padding length ever changes or a different year prefix appears alongside 2026 entries.

---

### [BUG] Procurement page overstates "Inventory Value" in summary cards  
**File:** [`app/(dashboard)/procurement/page.tsx:44–47`](app/(dashboard)/procurement/page.tsx)

```ts
const totalInventoryValue = recentBatches.reduce(
  (s, b) => s + b.landedCostPerBagPoisha * b.initialBagsCount,  // ← initialBagsCount, not current
  0,
);
```

The stat card "Inventory Value" multiplies landed cost by **initial** bags received, not **current** remaining bags. After any sales or write-offs, this number overstates the actual stock value. The dashboard KPI correctly uses `currentBagsCount × landedCostPerBagPoisha`, but the procurement page does not.

---

### [BUG] Stock adjustment dialog only shows the most recent 20 batches  
**File:** [`app/(dashboard)/procurement/page.tsx:21–39`](app/(dashboard)/procurement/page.tsx)

```ts
const recentBatches = await prisma.inventoryBatch.findMany({
  take: 20,
  ...
});
const adjustmentBatches = recentBatches.filter((b) => b.currentBagsCount > 0);
```

`adjustmentBatches` is derived from `recentBatches` which is capped at 20. Once there are more than 20 batches, older batches with remaining stock cannot be selected for write-off in the stock adjustment dialog.

---

### [BUG] `formatTaka` helper duplicated across 6 files  
The same formatting function is copy-pasted in:
- [`app/(dashboard)/page.tsx:16`](app/(dashboard)/page.tsx)
- [`app/(dashboard)/procurement/page.tsx:11`](app/(dashboard)/procurement/page.tsx)
- [`app/(dashboard)/retailers/page.tsx:11`](app/(dashboard)/retailers/page.tsx)
- [`app/(dashboard)/ledgers/page.tsx:7`](app/(dashboard)/ledgers/page.tsx)
- [`components/sales/sale-builder.tsx:61`](components/sales/sale-builder.tsx)
- [`components/retailers/retailer-table.tsx:21`](components/retailers/retailer-table.tsx)

[`lib/currency.ts`](lib/currency.ts) already has `toPoisha` and `toTaka`. A `formatTaka(poisha: number): string` should be added there and imported everywhere.

---

### [BUG] `nextKey` counter in SaleBuilder is a module-level mutable variable  
**File:** [`components/sales/sale-builder.tsx:65`](components/sales/sale-builder.tsx)

```ts
let nextKey = 1;
```

This lives at module scope and is mutated by every render cycle. In React 18 strict mode (dev), effects run twice and this can cause duplicate keys. It should be replaced with `useRef` or a `useId`-based approach.

---

## 4. UI/UX Issues

### [UX] `/retailers` page `AddRetailerDialog` button not visible on mobile  
**File:** [`app/(dashboard)/retailers/page.tsx:51–58`](app/(dashboard)/retailers/page.tsx)

The `AddRetailerDialog` button sits in a flex row: left side is `hidden md:block` (desktop heading), right side is the button. On mobile the heading is hidden but the button remains — however it's inside a `justify-between` container with nothing on the left, making it jump to the right edge with no context label. On a 375px screen with a search field below, a floating isolated button with no label context is disorienting.

**Fix:** Always show a visible label ("Add Retailer") or use a floating action button pattern on mobile.

---

### [UX] 6-item bottom nav bar is too crowded on small phones  
**File:** [`components/layout/nav-config.ts`](components/layout/nav-config.ts)

Six tabs in the bottom nav at 375px ≈ 62px wide each, with icon + shortLabel. `"Accounting"` (fake page) and `"Ledger"` (real page) are both present. After deleting the fake accounting page, the nav becomes 5 items — still dense but workable. Labels like `"Acctg"` are ambiguous on a 4G phone in poor lighting conditions.

---

### [UX] Dashboard page heading hidden on mobile  
**Files:** [`app/(dashboard)/page.tsx:122–127`](app/(dashboard)/page.tsx), similar pattern in all pages

```tsx
<div className="hidden md:block">
  <h1>Dashboard</h1>
```

On mobile, the page has no title at all — just KPI cards with no context. The `TopHeader` shows the app name, not the current page name. The mobile user gets no orientation. The top header should display the current page title dynamically.

---

### [UX] "New Sale" page back button links to `/retailers`, not browser back  
**File:** [`app/(dashboard)/sales/new/page.tsx:53–60`](app/(dashboard)/sales/new/page.tsx)

The back arrow is a `<Link href="/retailers">` hardcode. If the user navigated to New Sale from Procurement (unlikely but possible), the back button still takes them to Retailers. Should use `router.back()` or a dynamic referrer.

---

### [UX] Price-per-bag input on SaleBuilder accepts non-integer values  
**File:** [`components/sales/sale-builder.tsx:355–360`](components/sales/sale-builder.tsx)

The price input converts to Poisha via `Math.round(parseFloat(...) * 100)`, so `13.505` BDT becomes 1351 Poisha. The `step="1"` attribute limits the stepper but the user can still type arbitrary decimals. While `Math.round` mitigates floating-point issues, the field label says "Price / bag (৳)" and has no indication to the user that decimals round.

---

### [UX] Stock adjustment dialog only supports write-downs, not corrections  
**File:** [`components/procurement/stock-adjustment-dialog.tsx`](components/procurement/stock-adjustment-dialog.tsx) / [`app/actions/stockAdjustment.ts`](app/actions/stockAdjustment.ts)

The SRS mentions "physical stock discrepancies due to packaging tears, transit damages, or moisture weight shifts." The current dialog only supports **negative** adjustments (write-offs). It does not support upward corrections (e.g., a recount that finds more bags than recorded). This is a logical constraint but should be explicitly stated in the UI.

---

### [UX] No loading/empty state on Dashboard when database is empty  
**File:** [`app/(dashboard)/page.tsx`](app/(dashboard)/page.tsx)

All KPI cards show `৳0` when there's no data, which looks like a functional dashboard with zero activity rather than a "no data yet" onboarding state. New installations should show a prominent empty state with call-to-action links.

---

### [UX] Sales page redirects to `/retailers` after 2 seconds — no confirmation  
**File:** [`components/sales/sale-builder.tsx:92–97`](components/sales/sale-builder.tsx)

```ts
if (state.status === "success") {
  const t = setTimeout(() => router.push("/retailers"), 2000);
```

After a sale is confirmed, the app shows a success banner then navigates away. The owner has no chance to see the invoice number prominently or print/share it before being redirected. Should show the invoice number clearly and offer navigation choices rather than auto-redirecting.

---

## 5. Schema & Data Integrity Gaps

### [SCHEMA] No `invoiceDate` index for aging queries  
The `SalesInvoice.invoiceDate` field has no database index. When receivables aging is implemented, queries like `WHERE invoiceDate < NOW() - INTERVAL '30 days'` on an unindexed column will do full table scans. Add `@@index([invoiceDate])` to `SalesInvoice`.

---

### [SCHEMA] No index on `retailerId` in `SalesInvoice`  
`SalesInvoice.retailerId` is a foreign key but has no explicit index (Prisma does not auto-index FK fields on PostgreSQL unless told to). Queries fetching all invoices for a retailer (needed for aging, history page) will scan.

---

### [SCHEMA] `LedgerLine` constraint not enforced at DB level  
The comment on `LedgerLine` says "Exactly one of debitPoisha or creditPoisha must be non-zero per row," but there is no database-level `CHECK` constraint enforcing this (e.g., `CHECK (debitPoisha > 0) XOR (creditPoisha > 0)`). A bug in a server action could insert a row where both are zero or both are non-zero without the DB rejecting it.

---

### [SCHEMA] `StockTransaction.journalEntryId` unique constraint prevents shared entries  
The `@unique` on `StockTransaction.journalEntryId` means one journal entry can link to only one stock transaction. This is correct for write-offs (1 adjustment = 1 journal entry) but means a multi-product sale that depletes multiple batches across multiple products cannot express the full depletion as a single journal entry linked to a stock record — which is why the sales action skips creating `StockTransaction` records entirely.

---

### [SCHEMA] Missing `Retailer` fields vs SRS  
The SRS model lists `isAuthorized Boolean` which is implemented, but the SRS also describes "trade license statuses" that are not in the schema. Future-proofing fields to add:
```prisma
tradeLicenseNo     String?
tradeLicenseExpiry DateTime?
isVerified         Boolean @default(false)
```

---

## 6. Performance Considerations

| Area | Issue | Recommendation |
|------|-------|----------------|
| Dashboard | 6 parallel Prisma queries including a full `inventoryBatch.findMany` (unbounded) | Add `take` limit or aggregate at DB level |
| Ledger page | `prisma.journalEntry.findMany` with full `lines` include — unbounded on large datasets | Add pagination |
| Procurement page | `take: 20` on `recentBatches` but `adjustmentBatches` is derived from it | Load adjustment batches in a separate unbounded query |
| Retailers page | Full table scan `findMany()` with no limit | Acceptable while retailer count is small (<100) |

---

## 7. Summary Checklist

| # | Area | Issue | Severity |
|---|------|-------|----------|
| 1 | `/accounting` page | Entirely hardcoded fake data | CRITICAL |
| 2 | `/retailer-matrix` page | Entirely hardcoded fake data | CRITICAL |
| 3 | Nav | Two overlapping accounting routes | CRITICAL |
| 4 | Payments | No retailer payment recording | CRITICAL |
| 5 | Receivables | No aging table | HIGH |
| 6 | Invoices | No invoice history/list view | HIGH |
| 7 | Payables | No AP settlement workflow | HIGH |
| 8 | PDF | No invoice/challan PDF generation | HIGH |
| 9 | Retailers | No edit / suspend UI | HIGH |
| 10 | Retailers | No detail/history page | HIGH |
| 11 | Seed | Missing equity account (3100) | HIGH |
| 12 | Sales | No `STOCK_OUTFLOW` transaction created | MEDIUM |
| 13 | Schema | Trade license fields missing | MEDIUM |
| 14 | Bug | Invoice year hardcoded "2026" | MEDIUM |
| 15 | Bug | Race condition in invoice sequence | MEDIUM |
| 16 | Bug | Procurement "Inventory Value" uses initial bags | MEDIUM |
| 17 | Bug | Adjustment dialog capped at 20 batches | MEDIUM |
| 18 | Bug | `formatTaka` duplicated 6× | LOW |
| 19 | Bug | `nextKey` at module scope in SaleBuilder | LOW |
| 20 | UX | Add retailer button context missing on mobile | MEDIUM |
| 21 | UX | 6-item bottom nav, two dead-end routes | MEDIUM |
| 22 | UX | Page titles hidden on mobile | LOW |
| 23 | UX | Back button hardcodes `/retailers` | LOW |
| 24 | UX | Auto-redirect hides invoice number | MEDIUM |
| 25 | UX | Write-offs only, no upward stock correction | LOW |
| 26 | Schema | No `invoiceDate` / `retailerId` indexes | LOW |
| 27 | Schema | No DB-level `CHECK` on `LedgerLine` | LOW |

---

## 8. Recommended Implementation Order

### Phase 1 — Fix broken pages (1–2 days)
1. Delete or replace `/accounting` with a live P&L view querying accounts 4100, 5100, 5200
2. Delete `/retailer-matrix` page and remove from nav
3. Rename nav "Ledger" to "Ledger" and repurpose "Accounting" slot for P&L once built

### Phase 2 — Payment & receivables (2–3 days)
4. Add `recordRetailerPayment()` server action (DR 1100 / CR 1300 + decrement retailer balance)
5. Add payment dialog on retailers page  
6. Mark invoices paid when balance is fully settled
7. Build receivables aging computation from `invoiceDate` on unpaid invoices

### Phase 3 — Invoice history & supplier AP (1–2 days)
8. Add `/sales` list page showing all `SalesInvoice` records with search
9. Add `recordSupplierPayment()` action (DR 2100 / CR 1100)

### Phase 4 — Data integrity fixes (0.5 day)
10. Fix invoice year to use `new Date().getFullYear()`
11. Fix `adjustmentBatches` to query separately without the `take: 20` limit
12. Fix procurement "Inventory Value" stat to use `currentBagsCount`
13. Add equity account `3100` to seed
14. Add `STOCK_OUTFLOW` `StockTransaction` creation in `sales.ts`
15. Extract `formatTaka` to `lib/currency.ts`

### Phase 5 — UX polish & PDF (3–5 days)
16. Show invoice number prominently on success, remove auto-redirect
17. Add retailer edit/suspend dialogs
18. Add `/retailers/[id]` detail page
19. Implement PDF invoice generation with `pdfkit`

---

*Report generated from full source review — all file references are clickable links to the exact file/line in the repository.*
