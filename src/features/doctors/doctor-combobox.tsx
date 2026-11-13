"use client";

import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { DoctorSummary } from "@/types/api";
import { useDoctorOptions } from "./api";

interface DoctorComboboxProps {
  id: string;
  value: DoctorSummary | null;
  onChange: (doctor: DoctorSummary) => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Searchable doctor picker. Options are fetched from the server as you type
 * (20 at a time), so it scales to any number of doctors — unlike a <select>
 * that would need every doctor loaded up front.
 */
export function DoctorCombobox({ id, value, onChange, invalid, describedBy }: DoctorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(query, 250);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: options = [], isFetching } = useDoctorOptions(debounced, open);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const select = (doctor: DoctorSummary) => {
    onChange(doctor);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      const option = options[active];
      if (option) select(option);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation(); // don't close the surrounding dialog
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-[5px] border border-input bg-card px-3 text-[15px] transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15",
          invalid && "border-destructive focus-within:ring-destructive/20",
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {open && <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-activedescendant={open && options[active] ? `${listId}-${options[active]._id}` : undefined}
          autoComplete="off"
          value={open ? query : (value?.name ?? "")}
          placeholder={open ? "Search by name, specialization or hospital…" : "Select a doctor"}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
        />
        {isFetching && open ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[5px] border bg-card py-1 shadow-pop"
        >
          {options.length === 0 && !isFetching && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No doctors found</li>}
          {options.map((doctor, index) => {
            const selected = value?._id === doctor._id;
            return (
              <li
                key={doctor._id}
                id={`${listId}-${doctor._id}`}
                role="option"
                aria-selected={selected}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => select(doctor)}
                onMouseEnter={() => setActive(index)}
                className={cn("flex cursor-pointer items-center gap-3 px-3 py-2", index === active && "bg-primary-soft")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{doctor.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {doctor.specialization}, {doctor.hospital}
                  </span>
                </span>
                {selected && <Check className="size-4 text-primary" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
