# Graph Report - .  (2026-06-22)

## Corpus Check
- Corpus is ~25,261 words - fits in a single context window. You may not need a graph.

## Summary
- 276 nodes · 493 edges · 23 communities (18 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Accounting Pages|Dashboard & Accounting Pages]]
- [[_COMMUNITY_Sales, Retailers & Stock Actions|Sales, Retailers & Stock Actions]]
- [[_COMMUNITY_Dev & Runtime Dependencies|Dev & Runtime Dependencies]]
- [[_COMMUNITY_Root Layout & UI Utilities|Root Layout & UI Utilities]]
- [[_COMMUNITY_Shadcn UI Component Config|Shadcn UI Component Config]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Sales Logic & Prisma Client|Sales Logic & Prisma Client]]
- [[_COMMUNITY_Project Docs & Session History|Project Docs & Session History]]
- [[_COMMUNITY_Runtime Package Dependencies|Runtime Package Dependencies]]
- [[_COMMUNITY_Navigation & Layout Shell|Navigation & Layout Shell]]
- [[_COMMUNITY_Procurement & Currency Utils|Procurement & Currency Utils]]
- [[_COMMUNITY_Graphify Knowledge Graph Tools|Graphify Knowledge Graph Tools]]
- [[_COMMUNITY_Prisma Database Models|Prisma Database Models]]
- [[_COMMUNITY_Financial Data Rules|Financial Data Rules]]
- [[_COMMUNITY_Dashboard Routing Pattern|Dashboard Routing Pattern]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Responsive Layout|Responsive Layout]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 61 edges
2. `compilerOptions` - 17 edges
3. `prisma` - 11 edges
4. `Card()` - 10 edges
5. `CardHeader()` - 10 edges
6. `CardTitle()` - 10 edges
7. `CardContent()` - 10 edges
8. `buttonVariants` - 9 edges
9. `scripts` - 9 edges
10. `Button()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Financial Data Integer Poisha Rule` --semantically_similar_to--> `Poisha Integer Storage Rule`  [INFERRED] [semantically similar]
  CLAUDE.md → SRS.md
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `README Project Overview` --references--> `Frahman & Brothers Project`  [INFERRED]
  README.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Double-Entry Accounting Transaction Flow** — srs_srs_journal_entry_model, srs_srs_ledger_line_model, srs_srs_account_model, srs_srs_double_entry_journal, srs_srs_acid_transaction_requirement [EXTRACTED 0.95]
- **B2B Sales Credit Validation & Invoicing Flow** — srs_srs_retailer_model, srs_srs_credit_limit_enforcement, srs_srs_sales_invoice_model, srs_srs_b2b_order_flow [EXTRACTED 0.95]
- **Graphify Knowledge Graph Build Pipeline** — skills_skill_graphify_extraction_pipeline, skills_skill_graphify_community_detection, references_extraction_spec_subagent_prompt, references_update_build_merge [EXTRACTED 0.90]

## Communities (23 total, 5 thin omitted)

### Community 0 - "Dashboard & Accounting Pages"
Cohesion: 0.10
Nodes (25): balanceSummary, ledgerEntries, metadata, DashboardPage(), formatTaka(), metadata, formatTaka(), LedgersPage() (+17 more)

### Community 1 - "Sales, Retailers & Stock Actions"
Cohesion: 0.11
Nodes (23): addRetailer(), RetailerFormState, AdjustmentFormState, logStockAdjustment(), NewSalePage(), AdjustmentBatch, initial, AddRetailerDialog() (+15 more)

### Community 2 - "Dev & Runtime Dependencies"
Cohesion: 0.08
Nodes (24): devDependencies, eslint, eslint-config-next, prisma, @prisma/compute-sdk, tsx, @types/node, @types/react (+16 more)

### Community 3 - "Root Layout & UI Utilities"
Cohesion: 0.13
Nodes (20): geist, metadata, RootLayout(), cn(), Badge(), badgeVariants, CardAction(), CardDescription() (+12 more)

### Community 4 - "Shadcn UI Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 6 - "Sales Logic & Prisma Client"
Cohesion: 0.16
Nodes (13): createSalesInvoice(), SaleLineInput, SalesFormState, databaseUrl, prisma, metadata, formatTaka(), initialState (+5 more)

### Community 7 - "Project Docs & Session History"
Cohesion: 0.16
Nodes (16): Frahman & Brothers Project, Prisma v7 Configuration, README Project Overview, Analytics System Build Session, B2B Sales Dashboard Session, Next.js Scaffold & DB Setup Session, Automated Accounting Engine, B2B Dealer & Credit Control Module (+8 more)

### Community 8 - "Runtime Package Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @base-ui/react, class-variance-authority, clsx, dotenv, lucide-react, next, @prisma/adapter-pg (+8 more)

### Community 9 - "Navigation & Layout Shell"
Cohesion: 0.27
Nodes (6): AppSidebar(), MobileBottomNav(), NavItem, navItems, TopHeader(), Separator()

### Community 10 - "Procurement & Currency Utils"
Cohesion: 0.29
Nodes (6): logProcurementIntake(), ProcurementFormState, toPoisha(), main(), initialState, Product

### Community 11 - "Graphify Knowledge Graph Tools"
Cohesion: 0.18
Nodes (11): Graphify Usage Rules, Extraction Subagent Prompt Spec, BFS/DFS Graph Traversal, Query Vocabulary Expansion, build_merge Graph Merge, Incremental File Detection, Community Detection & Labeling, Graphify Extraction Pipeline (+3 more)

### Community 12 - "Prisma Database Models"
Cohesion: 0.25
Nodes (9): Account Model, InventoryBatch Model, JournalEntry Model, LedgerLine Model, Product Model, Retailer Model, SalesInvoiceLine Model, SalesInvoice Model (+1 more)

### Community 13 - "Financial Data Rules"
Cohesion: 0.67
Nodes (3): Financial Data Integer Poisha Rule, ACID Transaction Requirement, Poisha Integer Storage Rule

## Knowledge Gaps
- **118 isolated node(s):** `metadata`, `balanceSummary`, `ledgerEntries`, `metadata`, `metadata` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Root Layout & UI Utilities` to `Dashboard & Accounting Pages`, `Sales, Retailers & Stock Actions`, `Sales Logic & Prisma Client`, `Navigation & Layout Shell`, `Procurement & Currency Utils`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Package Dependencies` to `Dev & Runtime Dependencies`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `prisma` connect `Sales Logic & Prisma Client` to `Dashboard & Accounting Pages`, `Sales, Retailers & Stock Actions`, `Procurement & Currency Utils`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `metadata`, `balanceSummary`, `ledgerEntries` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Accounting Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.09957325746799431 - nodes in this community are weakly interconnected._
- **Should `Sales, Retailers & Stock Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.10634920634920635 - nodes in this community are weakly interconnected._
- **Should `Dev & Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._