"use client";

import { ArrowLeft, Pencil, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { useSession } from "@/features/auth/api";
import { PatientsView } from "@/features/patients/patients-view";
import { CONDITIONS } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/utils";
import type { DoctorDetail } from "@/types/api";
import { useDoctor } from "./api";
import { DeleteDoctorDialog } from "./delete-doctor-dialog";
import { DoctorFormDialog } from "./doctor-form-dialog";

export function DoctorDetailView({ id }: { id: string }) {
  const { data: doctor, isPending, isError, error, refetch } = useDoctor(id);

  return (
    <div className="space-y-6">
      <Link href="/doctors" className={buttonClasses({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeft /> All doctors
      </Link>

      {isPending ? (
        <ProfileSkeleton />
      ) : isError ? (
        (error as { status?: number }).status === 404 || (error as { status?: number }).status === 400 ? (
          <Card>
            <EmptyState
              icon={UserX}
              title="Doctor not found"
              description="This doctor may have been deleted."
              action={
                <Link href="/doctors" className={buttonClasses({ variant: "outline" })}>
                  Back to doctors
                </Link>
              }
            />
          </Card>
        ) : (
          <Card>
            <ErrorState message={error.message} onRetry={() => refetch()} />
          </Card>
        )
      ) : (
        <>
          <DoctorProfile doctor={doctor} />
          <PatientsView doctor={doctor} showAddButton />
        </>
      )}
    </div>
  );
}

function DoctorProfile({ doctor }: { doctor: DoctorDetail }) {
  const router = useRouter();
  const { isAdmin } = useSession();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { stats } = doctor;
  const total = stats.totalPatients;

  const contact = [
    { term: "Phone", value: doctor.phone, href: `tel:${doctor.phone.replace(/\s/g, "")}` },
    { term: "Email", value: doctor.email, href: `mailto:${doctor.email}` },
    { term: "Joined", value: formatDate(doctor.createdAt) },
    { term: "Last admission", value: formatDate(stats.lastAdmission) },
  ];

  return (
    <section aria-label="Doctor profile">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[40px] leading-[0.95] font-bold sm:text-5xl">{doctor.name}</h1>
          <p className="mt-2 text-[17px]">
            {doctor.specialization} <span className="text-muted-foreground">at</span> {doctor.hospital}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive-ghost" onClick={() => setDeleting(true)}>
              <Trash2 /> Delete
            </Button>
          </div>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 text-sm lg:grid-cols-4">
        {contact.map(({ term, value, href }) => (
          <div key={term} className="min-w-0">
            <dt className="text-[13px] text-muted-foreground">{term}</dt>
            <dd className="truncate">
              {href ? (
                <a href={href} className="hover:text-primary hover:underline">
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* Caseload strip: same census-board treatment as the dashboard */}
      <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-sheet border bg-border sm:grid-cols-6 [&>*]:bg-card">
        <div className="px-4 py-3">
          <p className="text-[13px] text-muted-foreground">Patients</p>
          <p className="font-display text-4xl leading-none font-bold tabular-nums">{formatNumber(total)}</p>
        </div>
        {CONDITIONS.map((c) => {
          const n = stats.byCondition[c.value] ?? 0;
          return (
            <div key={c.value} className="px-4 py-3">
              <p className="flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
                <span className="h-3 w-1 shrink-0 rounded-[1px]" style={{ background: c.color }} aria-hidden />
                {c.label}
              </p>
              <p className={`font-display text-4xl leading-none font-bold tabular-nums ${c.value === "critical" && n > 0 ? "text-destructive" : ""}`}>{n}</p>
            </div>
          );
        })}
      </div>

      <DoctorFormDialog open={editing} doctor={doctor} onClose={() => setEditing(false)} />
      <DeleteDoctorDialog
        doctor={deleting ? doctor : null}
        patientCount={total}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.replace("/doctors")}
      />
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-11 w-72" />
      <Skeleton className="h-5 w-64" />
      <Skeleton className="mt-6 h-20 w-full" />
    </div>
  );
}
