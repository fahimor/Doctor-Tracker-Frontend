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
            className={cn(open && "border-foreground/50 bg-muted")}
          >
            <SlidersHorizontal />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-[3px] bg-primary px-1 text-xs font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-x-4 gap-y-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {children}
          <div className="flex items-end">
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
      <label htmlFor={htmlFor} className="text-[13px] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
