"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, navItems, type NavItem } from "./nav-config";

const PRIMARY_COUNT = 4;

function isItemActive(item: NavItem, pathname: string) {
  return item.href === "/"
    ? pathname === "/"
    : pathname === item.href || pathname.startsWith(item.href + "/");
}

function TabLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors active:opacity-70",
        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
      <span
        className={cn(
          "max-w-[60px] truncate text-center text-[10px] font-medium leading-none",
          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40",
        )}
      >
        {item.shortLabel}
      </span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = navItems.slice(0, PRIMARY_COUNT);
  const overflowItems = navItems.slice(PRIMARY_COUNT);
  const isMoreActive = overflowItems.some((item) => isItemActive(item, pathname));

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-sidebar-border bg-sidebar pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-3.5">
              <p className="text-sm font-semibold text-sidebar-foreground">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-3 py-2">
              {navGroups.map((group) => {
                const items = overflowItems.filter((item) => item.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="py-1.5">
                    <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/30">
                      {group}
                    </p>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isItemActive(item, pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                                  : "text-sidebar-foreground/35",
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
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar md:hidden"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-stretch">
          {primaryItems.map((item) => (
            <TabLink key={item.href} item={item} isActive={isItemActive(item, pathname)} />
          ))}
          {overflowItems.length > 0 && (
            <button
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="More navigation items"
              aria-expanded={moreOpen}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors active:opacity-70",
                isMoreActive || moreOpen ? "text-sidebar-primary" : "text-sidebar-foreground/40",
              )}
            >
              <MoreHorizontal
                className={cn("h-5 w-5 transition-transform", (isMoreActive || moreOpen) && "scale-110")}
              />
              <span
                className={cn(
                  "max-w-[60px] truncate text-center text-[10px] font-medium leading-none",
                  isMoreActive || moreOpen ? "text-sidebar-primary" : "text-sidebar-foreground/40",
                )}
              >
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
