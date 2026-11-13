import { CONDITION_BY_VALUE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PatientCondition } from "@/types/api";

/**
 * Triage-style condition marker: a coloured block plus the word, so the
 * meaning never depends on colour alone. Critical is set in bold red.
 */
export function ConditionBadge({ condition, className }: { condition: PatientCondition; className?: string }) {
  const meta = CONDITION_BY_VALUE[condition];
  const critical = condition === "critical";
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm whitespace-nowrap", critical && "font-bold text-destructive", className)}>
      <span className="h-3.5 w-1.5 rounded-[1px]" style={{ background: meta?.color }} aria-hidden />
      {meta?.label ?? condition}
    </span>
  );
}
