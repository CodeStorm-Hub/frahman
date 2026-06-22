# Graph Report - .  (2026-06-23)

## Corpus Check
- 136 files · ~83,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 541 nodes · 1053 edges · 60 communities (48 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.82)
- Token cost: 70,000 input · 17,725 output

## Community Hubs (Navigation)
- [[_COMMUNITY_SalesProcurement Pages & Shared UI|Sales/Procurement Pages & Shared UI]]
- [[_COMMUNITY_Dialog Forms (AddEdit Product, Retailer, Stock)|Dialog Forms (Add/Edit Product, Retailer, Stock)]]
- [[_COMMUNITY_Auth, Nav & Search Shell|Auth, Nav & Search Shell]]
- [[_COMMUNITY_package.json Dependencies|package.json Dependencies]]
- [[_COMMUNITY_Server Actions Payments, Procurement, Retailers, Prisma|Server Actions: Payments, Procurement, Retailers, Prisma]]
- [[_COMMUNITY_Loading Skeletons|Loading Skeletons]]
- [[_COMMUNITY_shadcnui components.json Config|shadcn/ui components.json Config]]
- [[_COMMUNITY_tsconfig Compiler Options|tsconfig Compiler Options]]
- [[_COMMUNITY_CSV Export Components|CSV Export Components]]
- [[_COMMUNITY_Dashboard KPIs & Charts|Dashboard KPIs & Charts]]
- [[_COMMUNITY_Project Docs (README, SRS, CLAUDE.md)|Project Docs (README, SRS, CLAUDE.md)]]
- [[_COMMUNITY_package.json Scripts|package.json Scripts]]
- [[_COMMUNITY_Audit Findings AccountingLedger Bugs|Audit Findings: Accounting/Ledger Bugs]]
- [[_COMMUNITY_plan.png Roadmap & June 22 Session Log|plan.png Roadmap & June 22 Session Log]]
- [[_COMMUNITY_graphify Skill Reference Docs|graphify Skill Reference Docs]]
- [[_COMMUNITY_Audit Findings StockInvoice Bugs|Audit Findings: Stock/Invoice Bugs]]
- [[_COMMUNITY_SRS Target Prisma Models|SRS Target Prisma Models]]
- [[_COMMUNITY_Root Layout & Theme Providers|Root Layout & Theme Providers]]
- [[_COMMUNITY_graphify AddWatchHooks Features|graphify Add/Watch/Hooks Features]]
- [[_COMMUNITY_June 22 Session Log (Dashboard Build)|June 22 Session Log (Dashboard Build)]]
- [[_COMMUNITY_Audit Findings Code Duplication Bugs|Audit Findings: Code Duplication Bugs]]
- [[_COMMUNITY_Audit Findings Missing Retailer Pages|Audit Findings: Missing Retailer Pages]]
- [[_COMMUNITY_Audit Findings Fake Accounting Page|Audit Findings: Fake Accounting Page]]
- [[_COMMUNITY_Audit Findings Trade License & June 23 Log|Audit Findings: Trade License & June 23 Log]]
- [[_COMMUNITY_Audit Findings Missing Payment Recording|Audit Findings: Missing Payment Recording]]
- [[_COMMUNITY_E2E Global Setup (Auth Cookie)|E2E Global Setup (Auth Cookie)]]
- [[_COMMUNITY_graphify ExportsTranscribe Reference|graphify Exports/Transcribe Reference]]
- [[_COMMUNITY_graphify MCPGitHub-Merge Reference|graphify MCP/GitHub-Merge Reference]]
- [[_COMMUNITY_Poisha Integer Financial Rule|Poisha Integer Financial Rule]]
- [[_COMMUNITY_CLAUDE.md RoutingNav Rules|CLAUDE.md Routing/Nav Rules]]
- [[_COMMUNITY_E2E Procurement Spec|E2E Procurement Spec]]
- [[_COMMUNITY_E2E Retailers Spec|E2E Retailers Spec]]
- [[_COMMUNITY_E2E Sales Spec|E2E Sales Spec]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_graphify FalkorDBNeo4j Exports|graphify FalkorDB/Neo4j Exports]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_CLAUDE.md Responsive Layout Rule|CLAUDE.md Responsive Layout Rule]]
- [[_COMMUNITY_graphify GraphML Export|graphify GraphML Export]]
- [[_COMMUNITY_graphify SVG Export|graphify SVG Export]]
- [[_COMMUNITY_NextAuth Route Handler|NextAuth Route Handler]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `formatTaka()` - 29 edges
3. `AUDIT_REPORT.md — Frahman full application audit` - 26 edges
4. `buttonVariants` - 17 edges
5. `compilerOptions` - 17 edges
6. `Button()` - 16 edges
7. `toPoisha()` - 15 edges
8. `Card()` - 14 edges
9. `CardContent()` - 14 edges
10. `CardHeader()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Code quality & architecture findings (error handling, loading states, missing infrastructure)` --semantically_similar_to--> `AUDIT_REPORT.md — Frahman full application audit`  [INFERRED] [semantically similar]
  J:/GitHub/frahman/plan.png → J:/GitHub/frahman/AUDIT_REPORT.md
- `"No Authentication Exists — All Routes Are Public" critical finding` --semantically_similar_to--> `Auth.js v5 + Recharts + skeletons + error boundaries + CSV exports`  [INFERRED] [semantically similar]
  J:/GitHub/frahman/plan.png → J:/GitHub/frahman/.remember/today-2026-06-22.done.md
- `Featured improvements: Financial Reports, Export/Print, Dashboard Charts, Alerts/Thresholds, Partial Payments, Procurement Enhancements` --semantically_similar_to--> `No PDF/challan generation via pdfkit [MISSING]`  [INFERRED] [semantically similar]
  J:/GitHub/frahman/plan.png → J:/GitHub/frahman/AUDIT_REPORT.md
- `DashboardPage()` --calls--> `formatTaka()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/currency.ts
- `RetailerDetailPage()` --calls--> `cn()`  [INFERRED]
  app/(dashboard)/retailers/[id]/page.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Knowledge Graph Build Pipeline** — skills_skill_graphify_extraction_pipeline, skills_skill_graphify_community_detection, references_extraction_spec_subagent_prompt, references_update_build_merge [EXTRACTED 0.90]
- **Double-Entry Accounting Transaction Flow** — srs_srs_journal_entry_model, srs_srs_ledger_line_model, srs_srs_account_model, srs_srs_double_entry_journal, srs_srs_acid_transaction_requirement [EXTRACTED 0.95]
- **B2B Sales Credit Validation & Invoicing Flow** — srs_srs_retailer_model, srs_srs_credit_limit_enforcement, srs_srs_sales_invoice_model, srs_srs_b2b_order_flow [EXTRACTED 0.95]
- **Critical-severity audit findings on Frahman dashboard fakery and navigation** — audit_accounting_page_fake, audit_retailer_matrix_fake, audit_overlapping_nav [EXTRACTED 1.00]
- **Receivables and payment-settlement feature gap group** — audit_no_payment_recording, audit_no_aging_table, audit_no_ap_settlement, salesinvoice_model_schema [INFERRED 0.85]
- **Chronological session log entries documenting Frahman build-out across 2026-06-22 and 06-23** — today_2026_06_22_scaffold, today_2026_06_22_audit_27_findings, today_2026_06_23_theme_license, today_2026_06_23_vercel_deploy_issue [INFERRED 0.85]

## Communities (60 total, 12 thin omitted)

### Community 0 - "Sales/Procurement Pages & Shared UI"
Cohesion: 0.06
Nodes (52): AccountingPage(), getAccountBalance(), metadata, createSalesInvoice(), SaleLineInput, SalesFormState, formatTaka(), LedgersPage() (+44 more)

### Community 1 - "Dialog Forms (Add/Edit Product, Retailer, Stock)"
Cohesion: 0.11
Nodes (33): createProduct(), ProductFormState, updateProduct(), AdjustmentFormState, logStockAdjustment(), metadata, RetailerDetailPage(), initialState (+25 more)

### Community 2 - "Auth, Nav & Search Shell"
Cohesion: 0.08
Nodes (29): signOutAction(), getSearchData(), SearchResult, { handlers, signIn, signOut, auth }, ThemeToggle(), AppSidebar(), MobileBottomNav(), NavGroup (+21 more)

### Community 3 - "package.json Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk, dotenv, lucide-react (+34 more)

### Community 4 - "Server Actions: Payments, Procurement, Retailers, Prisma"
Cohesion: 0.10
Nodes (20): PaymentFormState, recordRetailerPayment(), logProcurementIntake(), ProcurementFormState, addRetailer(), RetailerFormState, toggleRetailerAuthorization(), updateRetailer() (+12 more)

### Community 5 - "Loading Skeletons"
Cohesion: 0.17
Nodes (6): ChartSkeleton(), KpiCardsSkeleton(), TableSkeleton(), Card(), CardContent(), Skeleton()

### Community 6 - "shadcn/ui components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "tsconfig Compiler Options"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 8 - "CSV Export Components"
Cohesion: 0.13
Nodes (13): LedgerCsvExport(), Props, AddRetailerDialog(), daysSince(), metadata, RetailersPage(), RetailerTable(), Props (+5 more)

### Community 9 - "Dashboard KPIs & Charts"
Cohesion: 0.14
Nodes (10): AlertsBanner(), DashboardPage(), metadata, DataPoint, RevenueChart(), TooltipArgs, COLORS, DataPoint (+2 more)

### Community 10 - "Project Docs (README, SRS, CLAUDE.md)"
Cohesion: 0.19
Nodes (13): Frahman & Brothers Project, Prisma v7 Configuration, README Project Overview, Automated Accounting Engine, B2B Dealer & Credit Control Module, B2B Order Generation & Financial Clearance Flow, Chart of Accounts Architecture, Dynamic Credit Limit Enforcement Engine (+5 more)

### Community 11 - "package.json Scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:generate, db:migrate, db:push, db:seed, dev, lint (+5 more)

### Community 12 - "Audit Findings: Accounting/Ledger Bugs"
Cohesion: 0.20
Nodes (12): Stock adjustment dialog capped at 20 batches [BUG], Procurement page overstates Inventory Value (initialBagsCount) [BUG], Missing Equity account (3100 Owner's Capital) [MISSING], No supplier payment / AP settlement workflow [MISSING], No invoice history / sales list page [MISSING], No retailer editing/suspension UI [MISSING], AUDIT_REPORT.md — Frahman full application audit, LedgerLine debit/credit XOR constraint not enforced at DB level [SCHEMA] (+4 more)

### Community 13 - "plan.png Roadmap & June 22 Session Log"
Cohesion: 0.17
Nodes (12): No PDF/challan generation via pdfkit [MISSING], Code quality & architecture findings (error handling, loading states, missing infrastructure), Featured improvements: Financial Reports, Export/Print, Dashboard Charts, Alerts/Thresholds, Partial Payments, Procurement Enhancements, Implementation roadmap table (feature/effort/impact/suggested order), Frahman Improvement Analysis dashboard mockup (plan.png), "No Authentication Exists — All Routes Are Public" critical finding, UI/UX improvements: Search/Filter, Loading States, Mobile UX, Accessibility, Visual Polish, audit-impl: race-condition fix, AP settlement, receivables aging (+4 more)

### Community 14 - "graphify Skill Reference Docs"
Cohesion: 0.18
Nodes (11): Graphify Usage Rules, Extraction Subagent Prompt Spec, BFS/DFS Graph Traversal, Query Vocabulary Expansion, build_merge Graph Merge, Incremental File Detection, Community Detection & Labeling, Graphify Extraction Pipeline (+3 more)

### Community 15 - "Audit Findings: Stock/Invoice Bugs"
Cohesion: 0.28
Nodes (9): Race condition in invoice sequence numbering [BUG], Invoice ordering by string field is fragile [BUG], Invoice year hardcoded to 2026 [BUG], STOCK_OUTFLOW transactions not recorded during sales [MISSING], StockTransaction.journalEntryId unique constraint blocks shared entries [SCHEMA], app/actions/sales.ts, components/procurement/stock-adjustment-dialog.tsx, app/actions/stockAdjustment.ts (+1 more)

### Community 16 - "SRS Target Prisma Models"
Cohesion: 0.25
Nodes (9): Account Model, InventoryBatch Model, JournalEntry Model, LedgerLine Model, Product Model, Retailer Model, SalesInvoiceLine Model, SalesInvoice Model (+1 more)

### Community 17 - "Root Layout & Theme Providers"
Cohesion: 0.32
Nodes (5): geist, metadata, RootLayout(), Providers(), ThemeProvider()

### Community 18 - "graphify Add/Watch/Hooks Features"
Cohesion: 0.29
Nodes (6): /graphify add <url> command, needs_update flag file, graphify.watch module (--watch), graphify slash-command CLAUDE.md hook, graphify claude install/uninstall, graphify hook install/uninstall/status

### Community 19 - "June 22 Session Log (Dashboard Build)"
Cohesion: 0.33
Nodes (7): Frahman B2B warehouse-sales dashboard build (2026-06-22), Analytics dashboard + ledger audit page + stock adjustment, 27 AUDIT findings implementation pass, B2B Sales Dashboard implementation (retailers, invoicing, FIFO), Graphified frahman codebase (276 nodes/493 edges/23 communities), Procurement intake form/action/InventoryBatch-Journal txns, Next.js + Prisma Postgres scaffold session

### Community 20 - "Audit Findings: Code Duplication Bugs"
Cohesion: 0.33
Nodes (6): formatTaka helper duplicated across 6 files [BUG], nextKey counter module-level mutable variable in SaleBuilder [BUG], lib/currency.ts (toPoisha/toTaka), app/(dashboard)/page.tsx, components/retailers/retailer-table.tsx, components/sales/sale-builder.tsx

### Community 21 - "Audit Findings: Missing Retailer Pages"
Cohesion: 0.33
Nodes (6): No receivables aging table [MISSING], No /retailers/[id] detail/invoice-history page [MISSING], /retailer-matrix page hardcoded mock data [CRITICAL], app/(dashboard)/retailer-matrix/page.tsx, app/(dashboard)/retailers/page.tsx (real retailer directory), app/(dashboard)/sales/new/page.tsx

### Community 22 - "Audit Findings: Fake Accounting Page"
Cohesion: 0.50
Nodes (5): app/(dashboard)/accounting/page.tsx, /accounting page hardcoded mock data [CRITICAL], Two overlapping accounting nav items [CRITICAL], app/(dashboard)/ledgers/page.tsx (real ledger page), components/layout/nav-config.ts

### Community 23 - "Audit Findings: Trade License & June 23 Log"
Cohesion: 0.50
Nodes (5): Missing trade license / verification tracking fields [MISSING], Retailer Prisma model, .env bcrypt corruption fix + full E2E flow verification, Light/dark theme (next-themes) + trade license fields on Retailer, frahman.vercel.app deploy + unresolved CredentialsSignin bug

### Community 24 - "Audit Findings: Missing Payment Recording"
Cohesion: 0.40
Nodes (5): No retailer payment recording action [MISSING], No invoiceDate index for aging queries [SCHEMA], No index on retailerId in SalesInvoice [SCHEMA], app/actions/payments.ts (recordRetailerPayment — proposed), SalesInvoice Prisma model

### Community 25 - "E2E Global Setup (Auth Cookie)"
Cohesion: 0.60
Nodes (4): getAuthCookieViaApi(), globalSetup(), parseSetCookieHeaders(), STATE_FILE

### Community 26 - "graphify Exports/Transcribe Reference"
Cohesion: 0.40
Nodes (5): graphify benchmark (token reduction), .graphify_detect.json total_words gate, graphify export wiki, graphify.transcribe.transcribe_all(), GRAPHIFY_WHISPER_PROMPT domain hint

### Community 27 - "graphify MCP/GitHub-Merge Reference"
Cohesion: 0.50
Nodes (4): graphify.serve MCP stdio server, graphify clone <github-url>, graphify extract <path>, graphify merge-graphs

### Community 28 - "Poisha Integer Financial Rule"
Cohesion: 0.67
Nodes (3): Financial Data Integer Poisha Rule, ACID Transaction Requirement, Poisha Integer Storage Rule

## Knowledge Gaps
- **178 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Sales/Procurement Pages & Shared UI` to `Dialog Forms (Add/Edit Product, Retailer, Stock)`, `Auth, Nav & Search Shell`, `Server Actions: Payments, Procurement, Retailers, Prisma`, `Loading Skeletons`, `CSV Export Components`, `Dashboard KPIs & Charts`, `Root Layout & Theme Providers`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `AUDIT_REPORT.md — Frahman full application audit` connect `Audit Findings: Accounting/Ledger Bugs` to `plan.png Roadmap & June 22 Session Log`, `Audit Findings: Stock/Invoice Bugs`, `June 22 Session Log (Dashboard Build)`, `Audit Findings: Code Duplication Bugs`, `Audit Findings: Missing Retailer Pages`, `Audit Findings: Fake Accounting Page`, `Audit Findings: Trade License & June 23 Log`, `Audit Findings: Missing Payment Recording`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `formatTaka()` connect `Sales/Procurement Pages & Shared UI` to `CSV Export Components`, `Dialog Forms (Add/Edit Product, Retailer, Stock)`, `Server Actions: Payments, Procurement, Retailers, Prisma`, `Dashboard KPIs & Charts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `InvoicePrintPage()` and `RetailerDetailPage()`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AUDIT_REPORT.md — Frahman full application audit` (e.g. with `Code quality & architecture findings (error handling, loading states, missing infrastructure)` and `27 AUDIT findings implementation pass`) actually correct?**
  _`AUDIT_REPORT.md — Frahman full application audit` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `buttonVariants` (e.g. with `InvoicePrintPage()` and `RetailerDetailPage()`) actually correct?**
  _`buttonVariants` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._