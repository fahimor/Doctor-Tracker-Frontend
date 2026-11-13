"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
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
 * Rows are memoised: when a dialog opens or the list refetches with
 * identical data, React skips re-rendering unchanged rows.
 */
const PatientRow = memo(function PatientRow({ patient: p, showDoctor, canEdit, onEdit, onDelete }: { patient: Patient } & Omit<PatientsTableProps, "patients">) {
  return (
    <TR>
      <TD>
        <p className="font-bold">{p.name}</p>
        <p className="text-[13px] text-muted-foreground tabular-nums">{p.phone}</p>
      </TD>
      <TD className="tabular-nums">{p.age}</TD>
      <TD className="text-muted-foreground">{genderLabel(p.gender)}</TD>
      <TD className="max-w-52 truncate">{p.diagnosis}</TD>
      <TD>
        <ConditionBadge condition={p.condition} />
      </TD>
      {showDoctor && (
        <TD className="max-w-56">
          {p.doctor ? (
            <Link href={`/doctors/${p.doctor._id}`} className="block truncate hover:text-primary hover:underline">
              {p.doctor.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </TD>
      )}
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(p.admissionDate)}</TD>
      {canEdit && (
        <TD className="text-right">
          <div className="flex justify-end gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`} title="Edit">
              <Pencil />
            </Button>
            <Button variant="destructive-ghost" size="icon-sm" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`} title="Delete">
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
    <li className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{p.name}</p>
          <p className="text-[13px] text-muted-foreground">
            {genderLabel(p.gender)}, {p.age} years
          </p>
        </div>
        <ConditionBadge condition={p.condition} />
      </div>
      <p className="mt-1.5 text-sm">{p.diagnosis}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Admitted {formatDate(p.admissionDate)}
        {showDoctor && p.doctor && (
          <>
            {" "}
            under{" "}
            <Link href={`/doctors/${p.doctor._id}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
              {p.doctor.name}
            </Link>
          </>
        )}
      </p>
      {canEdit && (
        <div className="mt-2.5 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
            <Pencil /> Edit
          </Button>
          <Button variant="destructive-ghost" size="sm" onClick={() => onDelete(p)}>
            <Trash2 /> Delete
          </Button>
        </div>
      )}
    </li>
  );
});

export function PatientsTable(props: PatientsTableProps) {
  const { patients, showDoctor, canEdit } = props;
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>Patient</TH>
              <TH>Age</TH>
              <TH>Gender</TH>
              <TH>Diagnosis</TH>
              <TH>Condition</TH>
              {showDoctor && <TH>Doctor</TH>}
              <TH>Admitted</TH>
              {canEdit && (
                <TH className="text-right">
                  <span className="sr-only">Actions</span>
                </TH>
              )}
            </tr>
          </THead>
          <tbody>
            {patients.map((p) => (
              <PatientRow key={p._id} patient={p} showDoctor={showDoctor} canEdit={canEdit} onEdit={props.onEdit} onDelete={props.onDelete} />
            ))}
          </tbody>
        </Table>
      </div>

      <ul className="divide-y md:hidden">
        {patients.map((p) => (
          <PatientCard key={p._id} patient={p} showDoctor={showDoctor} canEdit={canEdit} onEdit={props.onEdit} onDelete={props.onDelete} />
        ))}
      </ul>
    </>
  );
}

export function PatientsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-busy aria-label="Loading patients">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 px-5 py-3.5">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="hidden h-3.5 w-24 md:block" />
          <Skeleton className="hidden h-3.5 w-24 lg:block" />
        </div>
      ))}
    </div>
  );
}
