# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project: Integrated Inventory & Financial Management System

**Client:** Frahman & Brothers

**Location:** Kawkhali, South Bazar, Pirojpur, Bangladesh

**Target Operator:** Owner-Operator (Solo Management)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the complete functional and non-functional requirements for the custom web application designed for Frahman & Brothers. The application unifies **government-linked fertilizer procurement**, **single-warehouse inventory logistics**, and **automated double-entry B2B credit accounting** into a single system optimized for a single owner-operator.

### 1.2 Scope

The system manages the end-to-end lifecycle of fertilizer distribution:

* Recording official government allotments (BADC/BCIC) along with transport and labor loading overheads.
* Tracking warehouse stock counts across the core product line (Urea, TSP, MOP, DAP).
* Enforcing credit-limit control boundaries over a verified network of local retail dealers.
* Automating real-time financial ledger updates (Assets, Receivables, COGS, Revenues) without requiring manual bookkeeping entries.

---

## 2. System Architecture

The application uses a secure, type-safe, monolithic architecture designed to balance low operational maintenance with absolute financial transactional security.

```
+-----------------------------------------------------------------------+
|                           Next.js Client UI                           |
|               (Tailwind CSS + Shadcn Dashboard Widgets)               |
+------------------------------------------+----------------------------+
                                           |
                               HTTP / JSON | (Server Actions & API)
                                           v
+-----------------------------------------------------------------------+
|                    Next.js Server-Side API Engine                     |
|           (TypeScript Business Logic & Validation Pipelines)          |
+------------------------------------------+----------------------------+
                                           |
                                Prisma ORM | (Type-safe Queries)
                                           v
+-----------------------------------------------------------------------+
|                       PostgreSQL Database Engine                      |
|             (ACID-Compliant Relational Data Ledger Stores)            |
+-----------------------------------------------------------------------+

```

### 2.1 Component Specifications

* **Frontend & Application Layer:** **Next.js (App Router)** leveraging **TypeScript**. This delivers server-rendered analytical views for rapid dashboard loads alongside secure Server Actions to execute transactional operations.
* **UI System:** **Tailwind CSS** combined with **Shadcn/ui** primitives, prioritizing mobile-responsive controls for seamless on-the-go adjustments in the warehouse.
* **Database Management Layer:** **Prisma ORM** mapping directly to a relational **PostgreSQL** instance, guaranteeing strict ACID (Atomicity, Consistency, Isolation, Durability) guarantees for financial transactions.
* **Document Generation Engine:** Server-side PDF layout generator (`pdfkit`) to generate physical distribution challans and delivery invoices for local retailers.

---

## 3. Core Features & Functionalities

### 3.1 Inventory & Procurement Module

* **Government Allocation Logging:** Input forms to log arrivals from official government depots, capturing the specific Government Allocation Order number or Delivery Challan.
* **True Landed Cost Engine:** Automated tracking tool that combines base fertilizer purchase rates with variable transport fees (covered vehicle rentals) and manual labor loading charges (coolie costs). It distributes these costs proportionally across individual units to determine the precise cost of goods sold.
* **Single Godown Digital Ledger:** A unified dashboard tracking total available 50kg bags for the primary catalog:
* *Urea* (High-Purity Nitrogen)
* *TSP* (Triple Super Phosphate)
* *MOP* (Muriate of Potash)
* *DAP* (Di-Ammonium Phosphate)


* **Physical Stock Adjustment Log:** Internal modification utility to reconcile physical stock discrepancies due to packaging tears, transit damages, or moisture weight shifts.

### 3.2 B2B Dealer & Credit Control Module

* **Authorized Retailer Directory:** Comprehensive CRM tracking store business names, verified proprietor phone numbers, local trade license statuses, and verification tags.
* **Dynamic Credit Limit Enforcement Engine:** A systemic gateway that checks a dealer's financial balance before authorizing a warehouse release. The system blocks sale confirmations if the item total pushes the dealer's balance past their credit limit.
* **Outstanding Receivables Aging Table:** Real-time collection workspace categorizing outstanding dealer balances by duration (e.g., 0-15 days, 16-30 days, 30+ days over maturity).

### 3.3 Automated Accounting Engine

* **Double-Entry Journal Automator:** A transactional system that generates zero-manual-input debit/credit rows across the ledger when processing sales or intake orders.
* **Chart of Accounts Architecture:** Clean predefined accounting categories initialized automatically via backend migration scripts:
* *Assets:* Cash/Bank Accounts, Accounts Receivable (Retailers), Inventory Assets (Fertilizer Stocks).
* *Liabilities:* Accounts Payable (Government/Supplier Lines).
* *Equity:* Owner's Capital.
* *Revenue:* Wholesale Fertilizer Revenue.
* *Expenses:* Cost of Goods Sold (COGS), Transport/Logistics Overhead, Inventory Loss.


* **Instant Financial Health Overview:** A central interface generating cash flow readouts, estimated net margins, and true balance sheet overviews on demand.

---

## 4. User Stories & Detailed Behavioral Flows

### 4.1 System Operator User Stories

* **Stock Ingestion:** *As the business owner, I want to record an incoming batch from a government depot alongside transport invoices, so that my available bag counts increase and my inventory asset value adjusts to reflect the true landed cost.*
* **Credit Sale Processing:** *As the business owner, I want to create a sales order for an authorized retailer, so that the system can verify their credit limit, reduce my inventory count, update their accounts receivable profile, and generate a printable invoice.*
* **Inventory Damage Reconciliation:** *As the business owner, I want to log broken or water-damaged bags, so that my physical counts stay accurate and the financial loss is correctly categorized on my income statements.*

### 4.2 System Behavioral Flows

#### Flow A: Stock Sourcing and Value Processing

1. The operator navigates to the **Procurement Portal** and selects the incoming Product (e.g., *Urea*).
2. The operator enters the physical `Bags Count` received and the `Government Challan Reference ID`.
3. The operator populates logistical cost rows: `Transport Truck Fee (TK)` and `Coolie Labor Fee (TK)`.
4. Upon clicking **Submit Intake Order**:
* The system increments physical stock tables.
* The system computes: $\text{Landed Cost Per Bag} = \text{Regulated Base Rate} + \frac{\text{Transport Fee} + \text{Labor Fee}}{\text{Total Bags}}$.
* The system writes a unified cryptographic Journal Entry transaction block (Debits *Inventory Asset* / Credits *Accounts Payable* or *Cash*).



#### Flow B: B2B Order Generation & Financial Clearance Verification

1. The operator opens the **Sales Terminal** and selects a local retailer from the directory drop-down.
2. The UI instantly fetches and displays the retailer's `Current Debt Balance` and `Approved Credit Limit`.
3. The operator updates items to build the customer order (e.g., 100 bags of TSP).
4. The system calculates the invoice total in real time.
5. **Validation Check Engine:**
* *Condition Met:* If $\text{Current Balance} + \text{New Invoice Total} > \text{Credit Limit}$, the checkout primary validation system turns red, disables the confirmation button, and surfaces a structural override checkbox warning.
* *Condition Clear:* The operator processes submission. The application decrements godown records, creates a unique chronological Invoice number, debits the dealer's *Accounts Receivable*, and credits *Wholesale Fertilizer Revenue*.



---

## 5. Production Database Schema (Prisma Blueprint)

The following relational structure must be implemented inside your PostgreSQL instance. Every financial row uses integers tracking value in **Poisha** ($1 \text{ TK} = 100 \text{ Poisha}$) to protect data structures against precision math calculation drift.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TransactionType {
  STOCK_INFLOW
  STOCK_OUTFLOW
  STOCK_ADJUSTMENT
}

enum AccountCategory {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

model Product {
  id                 String             @id @default(uuid())
  name               String             // Urea, TSP, MOP, DAP
  chemicalSpec       String             // e.g., "46% Nitrogen", "46% P2O5"
  officialRatePerBag Int                // Stored in Poisha (e.g., 1350 TK = 135000)
  batches            InventoryBatch[]
  salesLines         SalesInvoiceLine[]
  stockTransactions  StockTransaction[]
}

model Retailer {
  id                   String         @id @default(uuid())
  shopName             String
  proprietorName       String
  phone                String         @unique
  address              String
  isAuthorized         Boolean        @default(true)
  creditLimitPoisha    Int            // Maximum ceiling allowed
  currentBalancePoisha Int            // Net outstanding balance owed
  invoices             SalesInvoice[]
}

model InventoryBatch {
  id                     String             @id @default(uuid())
  productId              String
  product                Product            @relation(fields: [productId], references: [id])
  governmentChallanNo    String             // Official tracking ID from BADC / BCIC
  initialBagsCount       Int
  currentBagsCount       Int
  baseCostPerBagPoisha   Int                // Regulated standard entry price
  logisticsCostPoisha    Int                // Composite transport truck rent + labor loading fees
  landedCostPerBagPoisha Int                // Formulaically: baseCost + (logisticsCost / initialBagsCount)
  receivedDate           DateTime           @default(now())
  stockTransactions      StockTransaction[]
}

model StockTransaction {
  id             String          @id @default(uuid())
  type           TransactionType
  productId      String
  product        Product         @relation(fields: [productId], references: [id])
  batchId        String?
  batch          InventoryBatch? @relation(fields: [batchId], references: [id])
  bagsCount      Int
  description    String?         // e.g., "Ruptured due to moisture contact"
  journalEntryId String?         @unique
  journalEntry   JournalEntry?   @relation(fields: [journalEntryId], references: [id])
  createdAt      DateTime        @default(now())
}

model Account {
  id          String          @id @default(uuid())
  code        String          @unique // e.g., "1100" (Cash), "1200" (Inventory Asset)
  name        String          
  category    AccountCategory
  ledgerLines LedgerLine[]
}

model JournalEntry {
  id               String            @id @default(uuid())
  referenceNo      String            // Maps directly to InvoiceNo or Challan string
  description      String
  entryDate        DateTime          @default(now())
  lines            LedgerLine[]
  stockTransaction StockTransaction?
  salesInvoiceId   String?           @unique
  salesInvoice     SalesInvoice?     @relation(fields: [salesInvoiceId], references: [id])
}

model LedgerLine {
  id             String       @id @default(uuid())
  journalEntryId String
  journalEntry   JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)
  accountId      String
  account        Account      @relation(fields: [accountId], references: [id])
  debitPoisha    Int          @default(0)
  creditPoisha   Int          @default(0)
}

model SalesInvoice {
  id                String             @id @default(uuid())
  invoiceNo         String             @unique // Structured ID format e.g., INV-2026-0001
  retailerId        String
  retailer          Retailer           @relation(fields: [retailerId], references: [id])
  invoiceDate       DateTime           @default(now())
  totalAmountPoisha Int
  isPaid            Boolean            @default(false)
  lines             SalesInvoiceLine[]
  journalEntry      JournalEntry?
}

model SalesInvoiceLine {
  id                String       @id @default(uuid())
  invoiceId         String
  invoice           SalesInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productId         String
  product           Product      @relation(fields: [productId], references: [id])
  bagsCount         Int
  pricePerBagPoisha Int
}

```

---

## 6. Non-Functional Requirements

### 6.1 Strict Data & Relational Integrity

* Every accounting balance adjustment MUST write symmetrical Debit and Credit lines wrapped inside an isolated PostgreSQL transaction block. If any single line fails, the entire database transaction rolls back automatically.
* Floating-point types (`float`, `double`, `decimal`) are barred from financial tracking schema fields to prevent localized rounding vulnerabilities over large bulk volume tallies.

### 6.2 Responsive Mobile Usability

* The system user interfaces must be tailored for seamless rendering across local mobile data channels (4G/5G broadband networks typical within the Pirojpur district zone).
* Form submittals should use client-side feedback indicators to prevent multi-click invoice generation overheads if bandwidth delays occur during transaction execution.

### 6.3 Security & Operational Architecture

* As an application focused on single owner-operator operations, database management logic is consolidated under a streamlined singular administrator dashboard, omitting multi-tier authorization matrix configurations to reduce deployment overhead.
* The application must use automated nightly database backups (`pg_dump` automation scripts) to prevent operational data loss.