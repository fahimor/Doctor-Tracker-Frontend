"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { CONDITION_BY_VALUE, GENDERS } from "@/lib/constants";
import { formatMonth, formatNumber, formatShortDate } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

/*
 * All Recharts code lives in this file, which is loaded with next/dynamic.
 * Recharts is the largest dependency in the app, so the dashboard shell and
 * stat cards render first and the charts stream in as a separate chunk.
 */

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
} as const;

interface TooltipItem {
  name?: string | number;
  value?: unknown;
  color?: string;
  dataKey?: unknown;
  payload?: { fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: unknown;
  labelFormatter?: (label: string) => string;
}

function ChartTooltip({ active, payload, label, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-xs shadow-pop">
      {label !== undefined && label !== null && label !== "" && <p className="mb-1.5 font-semibold text-foreground">{labelFormatter ? labelFormatter(String(label)) : String(label)}</p>}
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={String(item.dataKey ?? item.name)} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: item.color ?? item.payload?.fill }} aria-hidden />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto pl-3 font-semibold text-foreground tabular-nums">{formatNumber(Number(item.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartEmpty({ message = "No data for this period" }: { message?: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{message}</div>;
}

/* ---------------- Admissions over time ---------------- */

function AdmissionsTrend({ stats }: { stats: DashboardStats }) {
  const unit = stats.period.unit;
  const fmt = unit === "month" ? formatMonth : formatShortDate;
  const hasData = stats.admissionsTrend.some((d) => d.total > 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Patient admissions"
        description={`New admissions per ${unit}, with critical cases highlighted`}
        action={
          <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" /> All admissions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-4" /> Critical
            </span>
          </div>
        }
      />
      <div className="h-72 px-2 pt-4 pb-3">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.admissionsTrend} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fill-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fill-critical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" {...axisProps} tickFormatter={fmt} minTickGap={24} tickMargin={8} />
              <YAxis {...axisProps} allowDecimals={false} width={48} />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                content={({ active, payload, label }) => (
                  <ChartTooltip active={active} payload={payload} label={label} labelFormatter={(l) => (unit === "week" ? `Week of ${fmt(l)}` : fmt(l))} />
                )}
              />
              <Area type="monotone" dataKey="total" name="Admissions" stroke="var(--chart-1)" strokeWidth={2.25} fill="url(#fill-total)" />
              <Area type="monotone" dataKey="critical" name="Critical" stroke="var(--chart-4)" strokeWidth={2} fill="url(#fill-critical)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </div>
    </Card>
  );
}

/* ---------------- Condition breakdown ---------------- */

function ConditionBreakdown({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsByCondition.map((c) => ({
    name: CONDITION_BY_VALUE[c.condition]?.label ?? c.condition,
    value: c.count,
    fill: CONDITION_BY_VALUE[c.condition]?.color ?? "var(--chart-2)",
    condition: c.condition,
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader title="Patients by condition" description="Current status of all patients" />
      <div className="relative h-52">
        {total > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} />} />
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0} isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell key={d.condition} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{formatNumber(total)}</span>
              <span className="text-xs text-muted-foreground">patients</span>
            </div>
          </>
        ) : (
          <ChartEmpty message="No patients yet" />
        )}
      </div>
      <ul className="space-y-2 px-5 pt-2 pb-5">
        {data.map((d) => (
          <li key={d.condition}>
            <Link href={`/patients?condition=${d.condition}`} className="flex items-center gap-2 rounded-md text-sm hover:text-primary">
              <span className="size-2.5 rounded-full" style={{ background: d.fill }} aria-hidden />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="ml-auto font-semibold tabular-nums">{formatNumber(d.value)}</span>
              <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">{Math.round((d.value / total) * 100)}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------- Patients per doctor ---------------- */

function PatientsPerDoctor({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsPerDoctor.map((d) => ({ ...d, short: d.name.replace(/^Dr\.\s*/, "") }));

  return (
    <Card>
      <CardHeader title="Patients per doctor" description="Top 10 doctors by caseload" />
      <div className="px-2 pt-4 pb-3" style={{ height: Math.max(220, data.length * 34 + 40) }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap={6}>
              <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
              <XAxis type="number" {...axisProps} allowDecimals={false} />
              <YAxis type="category" dataKey="short" {...axisProps} width={128} tick={{ fill: "var(--foreground)", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} />} />
              <Bar dataKey="count" name="Patients" fill="var(--chart-2)" radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="No patients yet" />
        )}
      </div>
    </Card>
  );
}

/* ---------------- Doctors by specialization ---------------- */

function Specializations({ stats }: { stats: DashboardStats }) {
  const data = stats.doctorsBySpecialization;
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card>
      <CardHeader title="Doctors by specialization" description={`${data.length} specializations across the network`} />
      <ul className="space-y-3 px-5 pt-4 pb-5">
        {data.slice(0, 10).map((s) => (
          <li key={s.specialization}>
            <Link href={`/doctors?specialization=${encodeURIComponent(s.specialization)}`} className="group block">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium group-hover:text-primary">{s.specialization}</span>
                <span className="font-semibold tabular-nums">{s.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-chart-1 transition-all" style={{ width: `${(s.count / max) * 100}%` }} />
              </div>
            </Link>
          </li>
        ))}
        {data.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No doctors yet</li>}
      </ul>
    </Card>
  );
}

/* ---------------- Demographics ---------------- */

function Demographics({ stats }: { stats: DashboardStats }) {
  const genderTotal = stats.patientsByGender.reduce((s, g) => s + g.count, 0);
  const genderColors: Record<string, string> = { female: "var(--chart-6)", male: "var(--chart-2)", other: "var(--chart-3)" };

  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Patient demographics" description="Age groups and gender split" />
      <div className="grid gap-6 px-2 pt-4 pb-5 md:grid-cols-[1fr_240px] md:px-5">
        <div className="h-56">
          {stats.patientsByAge.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.patientsByAge} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="bucket" {...axisProps} tickMargin={8} />
                <YAxis {...axisProps} allowDecimals={false} width={48} />
                <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} labelFormatter={(l) => `Age ${l}`} />} />
                <Bar dataKey="count" name="Patients" fill="var(--chart-5)" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="No patients yet" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 px-3 md:px-0">
          <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label="Gender split">
            {stats.patientsByGender.map((g) => (
              <div key={g.gender} style={{ width: `${(g.count / Math.max(genderTotal, 1)) * 100}%`, background: genderColors[g.gender] }} />
            ))}
          </div>
          <ul className="space-y-2.5">
            {stats.patientsByGender.map((g) => (
              <li key={g.gender} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: genderColors[g.gender] }} aria-hidden />
                <span className="text-muted-foreground">{GENDERS.find((x) => x.value === g.gender)?.label ?? g.gender}</span>
                <span className="ml-auto font-semibold tabular-nums">{formatNumber(g.count)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {genderTotal ? Math.round((g.count / genderTotal) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdmissionsTrend stats={stats} />
        <ConditionBreakdown stats={stats} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PatientsPerDoctor stats={stats} />
        <Specializations stats={stats} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Demographics stats={stats} />
      </div>
    </div>
  );
}
