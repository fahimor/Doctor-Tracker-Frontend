"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import type { PageMeta } from "@/types/api";

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  noun?: string;
}

export const Pagination = memo(function Pagination({ meta, onPageChange, onLimitChange, noun = "results" }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const navBtn =
    "inline-flex size-8 items-center justify-center rounded-[4px] text-sm transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:px-5">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          <span className="font-bold text-foreground tabular-nums">
            {formatNumber(start)}–{formatNumber(end)}
          </span>{" "}
          of <span className="tabular-nums">{formatNumber(total)}</span> {noun}
        </span>
        {onLimitChange && (
          <label className="hidden items-center gap-2 sm:flex">
            <span className="sr-only">Rows per page</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 cursor-pointer rounded-[4px] border border-input bg-card px-2 text-sm text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          className={cn(navBtn, "hover:bg-muted")}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                navBtn,
                "tabular-nums",
                p === page ? "bg-foreground font-bold text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className={cn(navBtn, "hover:bg-muted")}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
});
