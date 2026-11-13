"use client";

import Link from "next/link";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { CONDITIONS, GENDERS } from "@/lib/constants";
import { formatMonth, formatNumber, formatShortDate } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

/*
 * Loaded with next/dynamic: Recharts is the largest dependency in the app, so
 * the census strip renders first and this chunk streams in after it.
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
}

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: unknown;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[4px] border bg-card px-3 py-2 text-[13px] shadow-pop">
      {label !== undefined && label !== null && label !== "" && (
        <p className="mb-1 font-bold">{labelFormatter ? labelFormatter(String(label)) : String(label)}</p>
      )}
      {payload.map((item) => (
        <p key={String(item.dataKey ?? item.name)} className="flex items-center gap-2">
          <span className="h-0.5 w-3" style={{ background: item.color }} aria-hidden />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto pl-4 font-bold tabular-nums">{formatNumber(Number(item.value))}</span>
        </p>
      ))}
    </div>
  );
}

/* ---------------- Admissions, printed on ECG chart paper ---------------- */

function AdmissionsStrip({ stats }: { stats: DashboardStats }) {
  const unit = stats.period.unit;
  const fmt = unit === "month" ? formatMonth : formatShortDate;
  const hasData = stats.admissionsTrend.some((d) => d.total > 0);
  const peak = stats.admissionsTrend.reduce((m, d) => (d.total > m.total ? d : m), stats.admissionsTrend[0] ?? { date: "", total: 0, critical: 0 });

  return (
    <Card className="overflow-hidden lg:col-span-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 pt-4 pb-3">
        <div>
          <h2 className="text-base font-bold">Admissions</h2>
          <p className="text-[13px] text-muted-foreground">New patients per {unit}. Critical cases traced in red.</p>
        </div>
        {hasData && (
          <p className="text-[13px] text-muted-foreground">
            Busiest {unit}: <span className="font-bold text-foreground">{unit === "week" ? `week of ${fmt(peak.date)}` : fmt(peak.date)}</span>,{" "}
            {peak.total} admitted
          </p>
        )}
      </div>
      <div className="ecg-paper h-72 border-t">
        {hasData ? (
          <div className="h-full animate-trace px-1 pt-4 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.admissionsTrend} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                <XAxis dataKey="date" {...axisProps} tickFormatter={fmt} minTickGap={28} tickMargin={6} />
                <YAxis {...axisProps} allowDecimals={false} width={44} />
                <Tooltip
                  cursor={{ stroke: "var(--ecg-trace)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload} label={label} labelFormatter={(l) => (unit === "week" ? `Week of ${fmt(l)}` : fmt(l))} />
                  )}
                />
                <Line type="linear" dataKey="total" name="Admitted" stroke="var(--ecg-trace)" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                <Line type="linear" dataKey="critical" name="Critical" stroke="var(--cond-critical)" strokeWidth={1.75} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">No admissions in this period.</p>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Condition: one proportional bar plus a table ---------------- */

function ConditionBreakdown({ stats }: { stats: DashboardStats }) {
  const counts = new Map(stats.patientsByCondition.map((c) => [c.condition, c.count]));
  const total = stats.patientsByCondition.reduce((s, c) => s + c.count, 0);

  return (
    <Card className="lg:col-span-4">
      <CardHeader title="By condition" description={`All ${formatNumber(total)} patients on record`} />
      <div className="px-5 py-4">
        <div className="flex h-3 gap-px overflow-hidden rounded-[2px]" role="img" aria-label="Share of patients by condition">
          {CONDITIONS.map((c) => {
            const n = counts.get(c.value) ?? 0;
            return n ? <div key={c.value} style={{ flexGrow: n, background: c.color }} /> : null;
          })}
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {CONDITIONS.map((c) => {
              const n = counts.get(c.value) ?? 0;
              return (
                <tr key={c.value} className="border-b last:border-0">
                  <td className="py-2">
                    <Link href={`/patients?condition=${c.value}`} className="inline-flex items-center gap-2 hover:text-primary hover:underline">
                      <span className="h-3.5 w-1.5 rounded-[1px]" style={{ background: c.color }} aria-hidden />
                      {c.label}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-bold tabular-nums">{formatNumber(n)}</td>
                  <td className="w-14 py-2 text-right text-muted-foreground tabular-nums">{total ? Math.round((n / total) * 100) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------------- Caseload ranking ---------------- */

function Caseload({ stats }: { stats: DashboardStats }) {
  const rows = stats.patientsPerDoctor;
  const max = Math.max(1, ...rows.map((r) => r.count));
  const avg = stats.totals.avgPatientsPerDoctor;

  return (
    <Card className="lg:col-span-7">
      <CardHeader title="Heaviest caseloads" description={`Network average is ${avg.toFixed(1)} patients per doctor`} />
      {rows.length ? (
        <ol className="px-5 py-2">
          {rows.map((r, i) => (
            <li key={r.doctorId} className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] items-center gap-x-3 border-b py-[7px] last:border-0 sm:grid-cols-[1.5rem_minmax(0,17rem)_minmax(0,1fr)_2.5rem]">
              <span className="font-display text-lg leading-none font-bold text-muted-foreground tabular-nums">{i + 1}</span>
              <Link href={`/doctors/${r.doctorId}`} className="min-w-0 truncate hover:text-primary">
                <span className="font-bold">{r.name}</span> <span className="text-[13px] text-muted-foreground">{r.specialization}</span>
              </Link>
              <span className="relative hidden h-2 sm:block" aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-[1px] bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
                <span className="absolute inset-y-[-3px] w-px bg-foreground/50" style={{ left: `${(avg / max) * 100}%` }} title="Average" />
              </span>
              <span className="text-right font-bold tabular-nums">{r.count}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="p-5 text-sm text-muted-foreground">No patients assigned yet.</p>
      )}
    </Card>
  );
}

/* ---------------- Demographics ---------------- */

function Demographics({ stats }: { stats: DashboardStats }) {
  const genderTotal = stats.patientsByGender.reduce((s, g) => s + g.count, 0);
  const genderColors: Record<string, string> = { female: "var(--chart-6)", male: "var(--chart-2)", other: "var(--chart-3)" };

  return (
    <Card className="flex flex-col lg:col-span-5">
      <CardHeader title="Patients by age" description="With the gender split below" />
      <div className="min-h-56 flex-1 px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.patientsByAge} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="bucket" {...axisProps} tickMargin={6} />
            <YAxis {...axisProps} allowDecimals={false} width={44} />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} labelFormatter={(l) => `Aged ${l}`} />}
            />
            <Bar dataKey="count" name="Patients" fill="var(--chart-5)" maxBarSize={44} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="border-t px-5 py-4">
        <div className="flex h-2 gap-px overflow-hidden rounded-[2px]" role="img" aria-label="Gender split">
          {stats.patientsByGender.map((g) => (
            <div key={g.gender} style={{ flexGrow: g.count, background: genderColors[g.gender] }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {stats.patientsByGender.map((g) => (
            <li key={g.gender} className="flex items-center gap-2">
              <span className="h-3.5 w-1.5 rounded-[1px]" style={{ background: genderColors[g.gender] }} aria-hidden />
              {GENDERS.find((x) => x.value === g.gender)?.label ?? g.gender}
              <span className="font-bold tabular-nums">{genderTotal ? Math.round((g.count / genderTotal) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ---------------- Specializations, as a tally board ---------------- */

function Specializations({ stats }: { stats: DashboardStats }) {
  return (
    <Card className="lg:col-span-12">
      <CardHeader title="Doctors by specialization" description="Select one to see those doctors" />
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {stats.doctorsBySpecialization.map((s) => (
          <li key={s.specialization} className="border-b sm:border-r">
            <Link href={`/doctors?specialization=${encodeURIComponent(s.specialization)}`} className="block px-5 py-3 hover:bg-primary-soft/50">
              <span className="font-display block text-3xl leading-none font-bold tabular-nums">{s.count}</span>
              <span className="mt-1 block truncate text-[13px] text-muted-foreground">{s.specialization}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <AdmissionsStrip stats={stats} />
      <ConditionBreakdown stats={stats} />
      <Caseload stats={stats} />
      <Demographics stats={stats} />
      <Specializations stats={stats} />
    </div>
  );
}
