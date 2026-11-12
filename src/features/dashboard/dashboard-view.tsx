"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ErrorState, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useSession } from "@/features/auth/api";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { DASHBOARD_RANGES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { DashboardRange } from "@/types/api";
import { useDashboardStats } from "./api";
import { StatCards, StatCardsSkeleton } from "./stat-cards";

function ChartsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-6 h-64 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mx-auto mt-6 size-44 rounded-full" />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80 p-5">
          <Skeleton className="h-4 w-32" />
        </Card>
        <Card className="h-80 p-5">
          <Skeleton className="h-4 w-40" />
        </Card>
      </div>
    </div>
  );
}

// Code-split: Recharts only downloads when the dashboard is opened.
const DashboardCharts = dynamic(() => import("./dashboard-charts"), { ssr: false, loading: ChartsSkeleton });

const DEFAULTS = { range: "30d" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function DashboardView() {
  const { user } = useSession();
  const { values, setFilters } = useUrlFilters(DEFAULTS);
  const range = (DASHBOARD_RANGES.some((r) => r.value === values.range) ? values.range : "30d") as DashboardRange;
  const rangeMeta = DASHBOARD_RANGES.find((r) => r.value === range)!;
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardStats(range);

  return (
    <>
      <PageHeader
        title={user ? `${greeting()}, ${user.name.split(" ")[0]}` : "Dashboard"}
        description={
          data
            ? `Showing activity from ${formatDate(data.period.from)} to ${formatDate(data.period.to)}`
            : "An overview of doctors, patients and admissions"
        }
        actions={
          <div role="tablist" aria-label="Time range" className="inline-flex rounded-xl border bg-card p-1 shadow-xs">
            {DASHBOARD_RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                role="tab"
                aria-selected={range === r.value}
                title={r.long}
                onClick={() => setFilters({ range: r.value })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  range === r.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
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
          <StatCardsSkeleton />
          <ChartsSkeleton />
        </div>
      ) : isError ? (
        <Card>
          <ErrorState message={error.message} onRetry={() => refetch()} />
        </Card>
      ) : (
        <div className="space-y-4">
          <StatCards stats={data} rangeLabel={rangeMeta.long} />
          <DashboardCharts stats={data} />
        </div>
      )}
    </>
  );
}
