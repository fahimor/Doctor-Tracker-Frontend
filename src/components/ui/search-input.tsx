"use client";

import { Search, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * Keeps keystrokes in local state (instant feedback) and only reports the
 * value upstream after the user pauses typing, so we don't fire a request
 * per keystroke.
 */
export function SearchInput({ value, onChange, placeholder = "Search…", className, label = "Search" }: SearchInputProps) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, 300);

  // Sync when the URL changes from elsewhere (e.g. "Clear filters").
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  // Reads the latest `value`/`onChange` without re-running the effect for them.
  const commit = useEffectEvent((next: string) => {
    if (next !== value) onChange(next);
  });

  useEffect(() => {
    commit(debounced.trim());
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-lg border border-input bg-card pr-9 pl-9 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/70 hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onChange("");
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
