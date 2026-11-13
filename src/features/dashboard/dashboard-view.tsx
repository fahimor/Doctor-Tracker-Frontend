"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ErrorState, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { DASHBOARD_RANGES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { DashboardRange } from "@/types/api";
import { useDashboardStats } from "./api";
import { CensusStrip, CensusStripSkeleton } from "./census-strip";

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="h-[23rem] p-5 lg:col-span-8">
        <Skeleton className="h-4 w-32" />
      </Card>
      <Card className="h-[23rem] p-5 lg:col-span-4">
        <Skeleton className="h-4 w-28" />
      </Card>
    </div>
  );
}

// Code-split: Recharts only downloads when the dashboard is opened.
const DashboardCharts = dynamic(() => import("./dashboard-charts"), { ssr: false, loading: ChartsSkeleton });

const DEFAULTS = { range: "30d" };

export function DashboardView() {
  const { values, setFilters } = useUrlFilters(DEFAULTS);
  const range = (DASHBOARD_RANGES.some((r) => r.value === values.range) ? values.range : "30d") as DashboardRange;
  const rangeMeta = DASHBOARD_RANGES.find((r) => r.value === range)!;
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardStats(range);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={data ? `${formatDate(data.period.from)} to ${formatDate(data.period.to)}` : "Doctors, patients and admissions at a glance"}
        actions={
          <div role="radiogroup" aria-label="Period" className="inline-flex rounded-[5px] border bg-card p-0.5">
            {DASHBOARD_RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={range === r.value}
                onClick={() => setFilters({ range: r.value })}
                className={cn(
                  "rounded-[4px] px-3 py-1.5 text-sm transition-colors",
                  range === r.value ? "bg-foreground font-bold text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="-mt-3 mb-3">
        <ProgressBar active={isFetching && !isPending} />
      </div>

      {isPending ? (
        <div className="space-y-4">
          <CensusStripSkeleton />
          <ChartsSkeleton />
        </div>
      ) : isError ? (
        <Card>
          <ErrorState message={error.message} onRetry={() => refetch()} />
        </Card>
      ) : (
        <div className="space-y-4">
          <CensusStrip stats={data} rangeLabel={rangeMeta.long} />
          <DashboardCharts stats={data} />
        </div>
      )}
    </>
  );
}
