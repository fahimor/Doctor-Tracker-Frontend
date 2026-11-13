"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
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
  /** Current sort key, so the Patients header can show and toggle its state. */
  sort: string;
  onSortChange: (sort: string) => void;
}

/** "Patients" column header: click for most patients first, again for fewest. */
function PatientsSortHeader({ sort, onSortChange }: Pick<DoctorsTableProps, "sort" | "onSortChange">) {
  const active = sort === "patients_desc" || sort === "patients_asc";
  const Icon = sort === "patients_desc" ? ArrowDown : sort === "patients_asc" ? ArrowUp : ArrowUpDown;
  const next = sort === "patients_desc" ? "patients_asc" : "patients_desc";
  return (
    <TH className="text-right" aria-sort={sort === "patients_desc" ? "descending" : sort === "patients_asc" ? "ascending" : "none"}>
      <button
        type="button"
        onClick={() => onSortChange(next)}
        className={`-mr-1 inline-flex items-center gap-1 rounded-[4px] px-1 py-0.5 hover:text-foreground ${active ? "font-bold text-foreground" : ""}`}
        title={next === "patients_desc" ? "Sort by most patients" : "Sort by fewest patients"}
      >
        Patients
        <Icon className="size-3.5" aria-hidden />
      </button>
    </TH>
  );
}

const DoctorRow = memo(function DoctorRow({ doctor: d, canEdit, onEdit, onDelete }: { doctor: DoctorListItem } & Pick<DoctorsTableProps, "canEdit" | "onEdit" | "onDelete">) {
  const router = useRouter();
  const href = `/doctors/${d._id}`;

  return (
    <TR
      className="cursor-pointer"
      onClick={(e) => {
        // The whole row opens the doctor; buttons and links handle their own clicks.
        if ((e.target as HTMLElement).closest("button, a")) return;
        router.push(href);
      }}
    >
      <TD>
        <Link href={href} className="block truncate font-bold hover:text-primary">
          {d.name}
        </Link>
        <p className="truncate text-[13px] text-muted-foreground">{d.email}</p>
      </TD>
      <TD>{d.specialization}</TD>
      <TD className="max-w-60 truncate text-muted-foreground">{d.hospital}</TD>
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{d.phone}</TD>
      <TD className="text-right font-bold tabular-nums">{d.patientCount}</TD>
      <TD className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(d.createdAt)}</TD>
      <TD className="text-right">
        <div className="flex justify-end gap-0.5">
          {canEdit && (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(d)} aria-label={`Edit ${d.name}`} title="Edit">
                <Pencil />
              </Button>
              <Button variant="destructive-ghost" size="icon-sm" onClick={() => onDelete(d)} aria-label={`Delete ${d.name}`} title="Delete">
                <Trash2 />
              </Button>
            </>
          )}
          <Link href={href} className="inline-flex size-8 items-center justify-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Open ${d.name}`}>
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
      <Link href={`/doctors/${d._id}`} className="flex items-center gap-4 px-4 py-3.5 active:bg-muted">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{d.name}</p>
          <p className="truncate text-sm">{d.specialization}</p>
          <p className="truncate text-[13px] text-muted-foreground">{d.hospital}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none font-bold tabular-nums">{d.patientCount}</p>
          <p className="text-xs text-muted-foreground">{d.patientCount === 1 ? "patient" : "patients"}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
              <PatientsSortHeader sort={props.sort} onSortChange={props.onSortChange} />
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
        <div key={i} className="flex items-center gap-6 px-5 py-3.5">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-3.5 w-28 md:block" />
          <Skeleton className="hidden h-3.5 w-36 lg:block" />
          <Skeleton className="h-5 w-8" />
        </div>
      ))}
    </div>
  );
}
