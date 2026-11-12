"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FilterBarProps {
  search: ReactNode;
  sort?: ReactNode;
  activeCount: number;
  onReset: () => void;
  children: ReactNode;
}

/**
 * Search + sort always visible; secondary filters live in a collapsible panel
 * (opened automatically when filters are active) to keep small screens tidy.
 */
export function FilterBar({ search, sort, activeCount, onReset, children }: FilterBarProps) {
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <div className="border-b px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">{search}</div>
        <div className="flex items-center gap-2">
          {sort && <div className="flex-1 sm:w-48 sm:flex-none">{sort}</div>}
          <Button
            variant="outline"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={cn(open && "border-primary/40 bg-primary-soft text-accent-foreground hover:bg-primary-soft")}
          >
            <SlidersHorizontal />
            Filters
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid animate-fade-in gap-3 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {children}
          <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
            <Button variant="ghost" size="sm" onClick={onReset} disabled={activeCount === 0}>
              <RotateCcw />
              Clear filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small labelled wrapper for a filter control. */
export function FilterField({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
