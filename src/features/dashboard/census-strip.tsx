import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { cn, formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

/**
 * Ward census board: one ruled strip of counts in condensed numerals,
 * read left to right, instead of four separate cards.
 */
function CensusCell({ label, value, note, critical }: { label: string; value: string; note: ReactNode; critical?: boolean }) {
  return (
    <div className="px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("font-display mt-1 text-[44px] leading-none font-bold tabular-nums sm:text-census", critical && "text-destructive")}>
        {value}
      </p>
      <p className="mt-2 text-[13px] text-muted-foreground">{note}</p>
    </div>
  );
}

function change(value: number | null, rangeLabel: string) {
  if (value === null) return <>first admissions in the {rangeLabel}</>;
  if (value === 0) return <>same as the previous {rangeLabel.replace(/^last /, "")}</>;
  const up = value > 0;
  return (
    <>
      <span className={cn("font-bold", up ? "text-success" : "text-destructive")}>
        {up ? "+" : "−"}
        {Math.abs(value)}%
      </span>{" "}
      on the previous {rangeLabel.replace(/^last /, "")}
    </>
  );
}

export function CensusStrip({ stats, rangeLabel }: { stats: DashboardStats; rangeLabel: string }) {
  const { totals } = stats;
  const criticalShare = totals.patients ? Math.round((totals.criticalPatients / totals.patients) * 1000) / 10 : 0;

  return (
    <section
      aria-label="Census"
      // gap-px over a border-coloured background draws hairlines between cells at any column count
      className="grid grid-cols-2 gap-px overflow-hidden rounded-sheet border bg-border lg:grid-cols-4 [&>*]:bg-card"
    >
      <CensusCell label="Doctors" value={formatNumber(totals.doctors)} note={<>{formatNumber(totals.newDoctors)} joined in the {rangeLabel}</>} />
      <CensusCell
        label={`Admitted, ${rangeLabel}`}
        value={formatNumber(totals.newPatients)}
        note={change(totals.newPatientsChange, rangeLabel)}
      />
      <CensusCell
        label="Patients on record"
        value={formatNumber(totals.patients)}
        note={<>{totals.avgPatientsPerDoctor.toFixed(1)} per doctor on average</>}
      />
      <CensusCell
        label="Critical now"
        value={formatNumber(totals.criticalPatients)}
        note={<>{criticalShare}% of all patients</>}
        critical
      />
    </section>
  );
}

export function CensusStripSkeleton() {
  return (
    <div className="grid grid-cols-2 rounded-sheet border bg-card lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-3 px-6 py-5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
