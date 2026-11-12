"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { GENDERS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@/types/api";
import { ConditionBadge } from "./condition-badge";

interface PatientsTableProps {
  patients: Patient[];
  showDoctor: boolean;
  canEdit: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const genderLabel = (g: Patient["gender"]) => GENDERS.find((x) => x.value === g)?.label ?? g;

/**
 * Rows are memoised: when a single dialog opens or the list refetches with
 * identical data, React skips re-rendering unchanged rows.
 */
const PatientRow = memo(function PatientRow({ patient: p, showDoctor, canEdit, onEdit, onDelete }: { patient: Patient } & Omit<PatientsTableProps, "patients">) {
  return (
    <TR>
      <TD>
        <div className="flex items-center gap-3">
          <Avatar name={p.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.email ?? p.phone}</p>
          </div>
        </div>
      </TD>
      <TD className="whitespace-nowrap text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{p.age}</span> yrs · {genderLabel(p.gender)}
      </TD>
      <TD className="max-w-48 truncate">{p.diagnosis}</TD>
      <TD>
        <ConditionBadge condition={p.condition} />
      </TD>
      {showDoctor && (
        <TD className="max-w-52">
          {p.doctor ? (
            <Link href={`/doctors/${p.doctor._id}`} className="block truncate font-medium hover:text-primary hover:underline">
              {p.doctor.name}
              <span className="block truncate text-xs font-normal text-muted-foreground">{p.doctor.specialization}</span>
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TD>
      )}
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(p.admissionDate)}</TD>
      {canEdit && (
        <TD className="text-right">
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}>
              <Pencil />
            </Button>
            <Button variant="destructive-ghost" size="icon-sm" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}>
              <Trash2 />
            </Button>
          </div>
        </TD>
      )}
    </TR>
  );
});

const PatientCard = memo(function PatientCard({ patient: p, showDoctor, canEdit, onEdit, onDelete }: { patient: Patient } & Omit<PatientsTableProps, "patients">) {
  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={p.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.age} yrs · {genderLabel(p.gender)} · {p.phone}
              </p>
            </div>
            <ConditionBadge condition={p.condition} />
          </div>
          <p className="mt-2 text-sm">{p.diagnosis}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Admitted {formatDate(p.admissionDate)}</span>
            {showDoctor && p.doctor && (
              <Link href={`/doctors/${p.doctor._id}`} className="font-medium text-primary hover:underline">
                {p.doctor.name}
              </Link>
            )}
          </div>
          {canEdit && (
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                <Pencil /> Edit
              </Button>
              <Button variant="destructive-ghost" size="sm" onClick={() => onDelete(p)}>
                <Trash2 /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
});

export function PatientsTable(props: PatientsTableProps) {
  const { patients, showDoctor, canEdit } = props;
  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>Patient</TH>
              <TH>Age / Gender</TH>
              <TH>Diagnosis</TH>
              <TH>Condition</TH>
              {showDoctor && <TH>Doctor</TH>}
              <TH>Admitted</TH>
              {canEdit && <TH className="text-right">Actions</TH>}
            </tr>
          </THead>
          <tbody>
            {patients.map((p) => (
              <PatientRow key={p._id} patient={p} {...props} />
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="divide-y md:hidden">
        {patients.map((p) => (
          <PatientCard key={p._id} patient={p} {...props} />
        ))}
      </ul>
    </>
  );
}

export function PatientsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-busy aria-label="Loading patients">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
          <Skeleton className="hidden h-3.5 w-24 lg:block" />
        </div>
      ))}
    </div>
  );
}
