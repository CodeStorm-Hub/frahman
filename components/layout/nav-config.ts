import {
  LayoutDashboard,
  Package,
  Store,
  ShoppingCart,
  ScrollText,
  Receipt,
  BarChart3,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortLabel: string;
  description: string;
  /** When true, item appears in desktop sidebar only, not the mobile bottom tab bar */
  desktopOnly?: boolean;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    shortLabel: "Home",
    description: "Overview & KPIs",
  },
  {
    label: "Procurement",
    href: "/procurement",
    icon: Package,
    shortLabel: "Procure",
    description: "Government Inflow",
  },
  {
    label: "Retailers",
    href: "/retailers",
    icon: Store,
    shortLabel: "Retailers",
    description: "B2B Credit Accounts",
  },
  {
    label: "New Sale",
    href: "/sales/new",
    icon: ShoppingCart,
    shortLabel: "Sale",
    description: "Create Invoice",
  },
  {
    label: "Invoices",
    href: "/sales",
    icon: Receipt,
    shortLabel: "Invoices",
    description: "Sales History",
  },
  {
    label: "Products",
    href: "/products",
    icon: FlaskConical,
    shortLabel: "Products",
    description: "Fertilizer Catalogue",
    desktopOnly: true,
  },
  {
    label: "P&L Overview",
    href: "/accounting",
    icon: BarChart3,
    shortLabel: "P&L",
    description: "Profit & Loss",
    desktopOnly: true,
  },
  {
    label: "Ledger",
    href: "/ledgers",
    icon: ScrollText,
    shortLabel: "Ledger",
    description: "General Ledger",
    desktopOnly: true,
  },
];
