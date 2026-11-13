"use client";

import { Search, X } from "lucide-react";
import { useDebouncedCommit } from "@/hooks/use-debounced-commit";
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
  const [text, setText] = useDebouncedCommit(value, onChange, 300);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-[5px] border border-input bg-card pr-9 pl-9 text-[15px] transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
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
