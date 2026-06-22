"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Store, Receipt, FlaskConical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSearchData, type SearchResult } from "@/app/actions/search";

const TYPE_ICON = {
  retailer: Store,
  invoice: Receipt,
  product: FlaskConical,
} as const;

const TYPE_LABEL = {
  retailer: "Retailers",
  invoice: "Invoices",
  product: "Products",
} as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Load data once when palette opens
  const load = useCallback(() => {
    if (results.length > 0) return;
    startTransition(async () => {
      const data = await getSearchData();
      setResults(data);
    });
  }, [results.length]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  // Filter by query
  const q = query.toLowerCase().trim();
  const filtered = q
    ? results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q),
      )
    : results;

  // Group by type
  const grouped = {
    retailer: filtered.filter((r) => r.type === "retailer").slice(0, 8),
    invoice: filtered.filter((r) => r.type === "invoice").slice(0, 8),
    product: filtered.filter((r) => r.type === "product").slice(0, 8),
  } as const;

  const hasResults = Object.values(grouped).some((g) => g.length > 0);

  return (
    <>
      {/* Trigger button — shown in sidebar and top-header via slot */}
      <button
        id="cmd-palette-trigger"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-md border border-border/50 bg-muted/20 px-3 py-2",
          "text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/40",
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search…</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Dialog overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

          <Command
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            shouldFilter={false}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              {isPending ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search retailers, invoices, products…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => setOpen(false)}
                className="rounded border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 hover:bg-muted/60"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {isPending && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading…
                </div>
              )}

              {!isPending && !hasResults && (
                <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
                  {q ? `No results for "${query}"` : "No data yet."}
                </Command.Empty>
              )}

              {!isPending &&
                (["retailer", "invoice", "product"] as const).map((type) => {
                  const group = grouped[type];
                  if (group.length === 0) return null;
                  const Icon = TYPE_ICON[type];
                  return (
                    <Command.Group
                      key={type}
                      heading={TYPE_LABEL[type]}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/50"
                    >
                      {group.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={`${item.type}-${item.id}`}
                          onSelect={() => navigate(item.href)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm",
                            "aria-selected:bg-muted/60 aria-selected:text-foreground",
                            "text-foreground/80 hover:bg-muted/40",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium leading-none">
                              {item.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {item.subtitle}
                            </p>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
            </Command.List>

            {/* Footer hint */}
            <div className="border-t border-border px-4 py-2">
              <p className="text-[10px] text-muted-foreground/40">
                ↑↓ navigate · Enter select · Esc close
              </p>
            </div>
          </Command>
        </div>
      )}
    </>
  );
}
