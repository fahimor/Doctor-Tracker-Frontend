import { Activity, ArrowDownRight, ArrowUpRight, HeartPulse, Stethoscope, Users, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { cn, formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  footer: React.ReactNode;
}

function StatCard({ label, value, icon: Icon, accent, footer }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        </div>
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)`, color: accent }}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{footer}</div>
    </Card>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="font-semibold text-success">New</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", up ? "text-success" : "text-destructive")}>
      <Icon className="size-3.5" aria-hidden />
      {Math.abs(value)}%
    </span>
  );
}

export function StatCards({ stats, rangeLabel }: { stats: DashboardStats; rangeLabel: string }) {
  const { totals } = stats;
  const criticalShare = totals.patients ? Math.round((totals.criticalPatients / totals.patients) * 1000) / 10 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total doctors"
        value={formatNumber(totals.doctors)}
        icon={Stethoscope}
        accent="var(--chart-1)"
        footer={
          <>
            <span className="font-semibold text-foreground">+{formatNumber(totals.newDoctors)}</span> joined in the {rangeLabel}
          </>
        }
      />
      <StatCard
        label="Total patients"
        value={formatNumber(totals.patients)}
        icon={Users}
        accent="var(--chart-2)"
        footer={
          <>
            <span className="font-semibold text-foreground">{formatNumber(totals.newPatients)}</span> admitted · <Delta value={totals.newPatientsChange} /> vs previous
          </>
        }
      />
      <StatCard
        label="Avg. patients per doctor"
        value={totals.avgPatientsPerDoctor.toFixed(1)}
        icon={Activity}
        accent="var(--chart-3)"
        footer={<>Across {formatNumber(totals.doctors)} active doctors</>}
      />
      <StatCard
        label="Critical patients"
        value={formatNumber(totals.criticalPatients)}
        icon={HeartPulse}
        accent="var(--chart-4)"
        footer={
          <>
            <span className="font-semibold text-foreground">{criticalShare}%</span> of all patients need urgent care
          </>
        }
      />
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="space-y-3 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-40" />
        </Card>
      ))}
    </div>
  );
}
