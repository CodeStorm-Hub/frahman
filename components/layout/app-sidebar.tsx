"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { CommandPalette } from "@/components/search/command-palette";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-xs font-bold text-sidebar-primary-foreground">F</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Frahman
        </span>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5">
        <CommandPalette />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex min-w-0 flex-col">
                  <span className="leading-none">{item.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 text-[10px] font-normal leading-none",
                      isActive
                        ? "text-sidebar-primary-foreground/60"
                        : "text-sidebar-foreground/35 group-hover:text-sidebar-accent-foreground/50"
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator className="mx-3 my-4 w-auto bg-sidebar-border" />

        <div className="px-3">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/25">
            Operations
          </p>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border px-5 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-sidebar-foreground/25">Frahman v1.0</p>
          <div className="flex items-center gap-1">
            <ThemeToggle className="h-7 w-7" />
            <form action={signOutAction}>
              <button
                type="submit"
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/30 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
