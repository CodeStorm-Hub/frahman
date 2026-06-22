"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navGroups, navItems } from "./nav-config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { CommandPalette } from "@/components/search/command-palette";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar",
        "md:flex md:w-16 lg:w-60"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3 lg:px-5">
        <div className="mx-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary lg:mx-0">
          <span className="text-xs font-bold text-sidebar-primary-foreground">F</span>
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-sidebar-foreground lg:inline">
          Frahman
        </span>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5">
        <CommandPalette />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-4 px-2 lg:px-3">
          {navGroups.map((group) => {
            const items = navItems.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="flex flex-col gap-0.5">
                <p className="hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/30 lg:block">
                  {group}
                </p>
                {items.map((item) => {
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
                      title={item.label}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        "justify-center lg:justify-start",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="hidden min-w-0 flex-col lg:flex">
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
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border px-3 py-3 lg:px-5">
        <Separator className="mb-3 hidden bg-sidebar-border lg:block" />
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                title="Sign out"
                className="mb-1 h-8 w-full justify-center gap-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:justify-start"
              />
            }
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline">Sign out</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of Frahman & Brothers?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => signOutAction()}>
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center justify-center lg:justify-between">
          <p className="hidden text-[11px] text-sidebar-foreground/25 lg:inline">
            Frahman v1.0
          </p>
          <ThemeToggle className="h-7 w-7" />
        </div>
      </div>
    </aside>
  );
}
