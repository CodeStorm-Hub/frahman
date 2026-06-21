# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Frahman & Brothers** — an integrated inventory and financial management system for a fertilizer distributor in Pirojpur, Bangladesh. Single owner-operator. Manages government procurement (BADC/BCIC allotments), warehouse stock, B2B retailer credit control, and double-entry accounting.

See [`SRS.md`](SRS.md) for the full requirements and target database schema.

## Commands

```bash
npm run dev          # start dev server (Turbopack, port 3000)
npm run build        # production build
npm run lint         # ESLint

npm run db:generate  # regenerate Prisma client after schema changes
npm run db:migrate   # run migrations (prisma migrate dev)
npm run db:push      # push schema changes without migration file
npm run db:seed      # run prisma/seed.ts
```

Type-check only (no emit):
```bash
npx tsc --noEmit
```

## Prisma v7 — Critical Differences

This project uses **Prisma ORM v7.8.0**, which has breaking changes from v5/v6:

- **`url` is removed from `datasource` in `schema.prisma`.** The connection URL lives exclusively in `prisma.config.ts` under `datasource.url`. Do not add `url = env("DATABASE_URL")` to the schema file — it causes a `P1012` error.
- **Generator provider is `"prisma-client"`**, not `"prisma-client-js"`. The generated client output is at `./generated/prisma/`.
- **`PrismaClient` requires either `accelerateUrl` or `adapter`** in its constructor. This project uses `accelerateUrl` (see `lib/prisma.ts`). Do not construct `new PrismaClient()` without one of these.
- **`PrismaPg` adapter is incompatible** with `prisma+postgres://` Accelerate URLs. Use `accelerateUrl` only.
- The `DATABASE_URL` format is `prisma+postgres://accelerate.prisma-data.net/?api_key=<JWT>`, stored in `.env` only. Never hardcode it.

## Architecture

### Routing

All user-facing pages live under the `(dashboard)` route group — a Next.js App Router parenthesized group that adds layout without affecting URLs. The root `app/layout.tsx` sets global dark mode (`class="dark"`) and the Geist font; `app/(dashboard)/layout.tsx` wires the shell (sidebar + mobile header + bottom nav).

```
app/
  layout.tsx                     ← root: dark mode, font, metadata
  globals.css                    ← Tailwind v4 theme with custom sidebar CSS vars
  (dashboard)/
    layout.tsx                   ← shell: AppSidebar + TopHeader + MobileBottomNav
    page.tsx                     ← /  — KPI dashboard
    procurement/page.tsx         ← /procurement
    retailer-matrix/page.tsx     ← /retailer-matrix
    accounting/page.tsx          ← /accounting
```

### Navigation

`components/layout/nav-config.ts` is the **single source of truth** for all nav items. Both the desktop sidebar and mobile bottom tab bar import from it. Add or rename routes there first.

### Responsive Layout Pattern

- **Desktop (`md:`)**: fixed left sidebar (`w-60`, `hidden md:flex`), main content offset `md:ml-60`
- **Mobile**: sticky top header (`md:hidden`) + fixed bottom tab bar (`md:hidden`, `h-16`), main content uses `pb-24` to clear the bottom nav
- Tables that may overflow: wrap in `overflow-x-auto` with a `min-w-[Npx]` on the table; use `hidden sm:table-cell` / `hidden md:table-cell` to progressively show less-critical columns

### UI Components

Shadcn/ui components (style: `base-nova`) live in `components/ui/`. Add new ones with:
```bash
npx shadcn@latest add <component>
```
Tailwind v4 is used — there is no `tailwind.config.js`. All theme customization is done via CSS custom properties in `app/globals.css` under `@theme inline`.

### Financial Data Rule

Per the SRS: **all monetary values must be stored as integers in Poisha** (1 BDT = 100 Poisha). Never use `Float` or `Decimal` types in Prisma schema fields for financial amounts. Display values are formatted in BDT (e.g., `৳12,40,000`) but stored as integers.

### Database Schema (target)

The current `prisma/schema.prisma` only has the placeholder `User` model. The production schema (defined in `SRS.md` §5) must be implemented, including: `Product`, `Retailer`, `InventoryBatch`, `StockTransaction`, `Account`, `JournalEntry`, `LedgerLine`, `SalesInvoice`, `SalesInvoiceLine`. Every financial transaction must write symmetrical debit/credit `LedgerLine` pairs inside a Prisma `$transaction`.

### Path Alias

`@/*` maps to the project root. Use `@/components/...`, `@/lib/...` etc. There is no `src/` directory.
