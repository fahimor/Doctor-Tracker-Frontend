"use client";

import { Building2, ChevronRight, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { DoctorListItem } from "@/types/api";

interface DoctorsTableProps {
  doctors: DoctorListItem[];
  canEdit: boolean;
  onEdit: (doctor: DoctorListItem) => void;
  onDelete: (doctor: DoctorListItem) => void;
}

function PatientCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
      <Users className="size-3.5 text-muted-foreground" aria-hidden />
      {count}
    </span>
  );
}

const DoctorRow = memo(function DoctorRow({ doctor: d, canEdit, onEdit, onDelete }: { doctor: DoctorListItem } & Omit<DoctorsTableProps, "doctors">) {
  const router = useRouter();
  const href = `/doctors/${d._id}`;

  return (
    <TR
      className="cursor-pointer"
      onClick={(e) => {
        // Whole row is clickable, but let buttons/links handle their own clicks.
        if ((e.target as HTMLElement).closest("button, a")) return;
        router.push(href);
      }}
    >
      <TD>
        <div className="flex items-center gap-3">
          <Avatar name={d.name} />
          <div className="min-w-0">
            <Link href={href} className="block truncate font-semibold hover:text-primary focus-visible:underline focus-visible:outline-none">
              {d.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{d.email}</p>
          </div>
        </div>
      </TD>
      <TD>
        <Badge tone="primary">{d.specialization}</Badge>
      </TD>
      <TD className="max-w-56 truncate text-muted-foreground">{d.hospital}</TD>
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{d.phone}</TD>
      <TD>
        <PatientCount count={d.patientCount} />
      </TD>
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(d.createdAt)}</TD>
      <TD className="text-right">
        <div className="flex justify-end gap-1">
          {canEdit && (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(d)} aria-label={`Edit ${d.name}`}>
                <Pencil />
              </Button>
              <Button variant="destructive-ghost" size="icon-sm" onClick={() => onDelete(d)} aria-label={`Delete ${d.name}`}>
                <Trash2 />
              </Button>
            </>
          )}
          <Link href={href} className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`View ${d.name}`}>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </TD>
    </TR>
  );
});

const DoctorCard = memo(function DoctorCard({ doctor: d }: { doctor: DoctorListItem }) {
  return (
    <li>
      <Link href={`/doctors/${d._id}`} className="flex items-start gap-3 p-4 transition-colors active:bg-muted">
        <Avatar name={d.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold">{d.name}</p>
            <PatientCount count={d.patientCount} />
          </div>
          <div className="mt-1">
            <Badge tone="primary">{d.specialization}</Badge>
          </div>
          <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" aria-hidden /> {d.hospital}
          </p>
        </div>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
});

export function DoctorsTable(props: DoctorsTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>Doctor</TH>
              <TH>Specialization</TH>
              <TH>Hospital</TH>
              <TH>Phone</TH>
              <TH>Patients</TH>
              <TH>Joined</TH>
              <TH className="text-right">
                <span className="sr-only">Actions</span>
              </TH>
            </tr>
          </THead>
          <tbody>
            {props.doctors.map((d) => (
              <DoctorRow key={d._id} doctor={d} canEdit={props.canEdit} onEdit={props.onEdit} onDelete={props.onDelete} />
            ))}
          </tbody>
        </Table>
      </div>
      <ul className="divide-y md:hidden">
        {props.doctors.map((d) => (
          <DoctorCard key={d._id} doctor={d} />
        ))}
      </ul>
    </>
  );
}

export function DoctorsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-busy aria-label="Loading doctors">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-5 w-24 rounded-full md:block" />
          <Skeleton className="hidden h-3.5 w-36 lg:block" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
