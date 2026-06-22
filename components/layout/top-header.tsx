"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./nav-config";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useSearchPalette } from "@/components/search/command-palette";
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

export function TopHeader() {
  const pathname = usePathname();
  const current =
    navItems.find((item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(item.href + "/")
    ) ?? navItems[0];

  const { setOpen: setSearchOpen } = useSearchPalette();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md md:ml-16 lg:hidden">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary md:hidden">
        <span className="text-xs font-bold text-sidebar-primary-foreground">F</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-none text-foreground">
          {current.label}
        </p>
        <p className="mt-0.5 text-xs leading-none text-muted-foreground">
          {current.description}
        </p>
      </div>
      <button
        onClick={() => setSearchOpen(true)}
        aria-label="Open search"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
      </button>
      <ThemeToggle />
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <button
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            />
          }
        >
          <LogOut className="h-4 w-4" />
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
    </header>
  );
}
