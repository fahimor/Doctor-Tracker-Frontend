import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, letting later ones win (`cn("p-2", cond && "p-4")`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const shortDateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
const numberFmt = new Intl.NumberFormat("en-US");

/** Dates from the API are date-only values stored at UTC midnight, so format in UTC. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return dateFmt.format(new Date(value));
}

export function formatShortDate(value: string | Date): string {
  return shortDateFmt.format(new Date(value));
}

export function formatMonth(value: string | Date): string {
  return monthFmt.format(new Date(value));
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

/** "2026-11-12" in local time, for <input type="date"> defaults. */
export function todayInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO -> "YYYY-MM-DD" for date inputs. */
export function toDateInputValue(value: string | undefined | null): string {
  return value ? value.slice(0, 10) : "";
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
