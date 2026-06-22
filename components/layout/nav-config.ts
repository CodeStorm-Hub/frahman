import {
  LayoutDashboard,
  Package,
  Store,
  ScrollText,
  Receipt,
  BarChart3,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export type NavGroup = "Overview" | "Sales" | "Inventory" | "Finance";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortLabel: string;
  description: string;
  /** Section header the item is grouped under in the desktop/tablet sidebar */
  group: NavGroup;
};

export const navGroups: NavGroup[] = ["Overview", "Sales", "Inventory", "Finance"];

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    shortLabel: "Home",
    description: "Overview & KPIs",
    group: "Overview",
  },
  {
    label: "Invoices",
    href: "/sales",
    icon: Receipt,
    shortLabel: "Invoices",
    description: "Sales History",
    group: "Sales",
  },
  {
    label: "Retailers",
    href: "/retailers",
    icon: Store,
    shortLabel: "Retailers",
    description: "B2B Credit Accounts",
    group: "Sales",
  },
  {
    label: "Procurement",
    href: "/procurement",
    icon: Package,
    shortLabel: "Procure",
    description: "Government Inflow",
    group: "Inventory",
  },
  {
    label: "Products",
    href: "/products",
    icon: FlaskConical,
    shortLabel: "Products",
    description: "Fertilizer Catalogue",
    group: "Inventory",
  },
  {
    label: "P&L Overview",
    href: "/accounting",
    icon: BarChart3,
    shortLabel: "P&L",
    description: "Profit & Loss",
    group: "Finance",
  },
  {
    label: "Ledger",
    href: "/ledgers",
    icon: ScrollText,
    shortLabel: "Ledger",
    description: "General Ledger",
    group: "Finance",
  },
];
