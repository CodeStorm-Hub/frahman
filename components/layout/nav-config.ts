import {
  LayoutDashboard,
  Package,
  Store,
  BookOpen,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortLabel: string;
  description: string;
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
    label: "Accounting",
    href: "/accounting",
    icon: BookOpen,
    shortLabel: "Ledger",
    description: "Accounting Ledgers",
  },
];
