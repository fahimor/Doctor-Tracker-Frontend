"use client";

import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    { icon: Building2, label: doctor.hospital },
    { icon: Phone, label: doctor.phone, href: `tel:${doctor.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: doctor.email, href: `mailto:${doctor.email}` },
    { icon: CalendarDays, label: `Joined ${formatDate(doctor.createdAt)}` },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-[color-mix(in_oklch,var(--chart-2)_20%,transparent)] sm:h-24" aria-hidden />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {/* Solid ring so the banner doesn't show through the translucent avatar fill */}
              <span className="rounded-full bg-card p-1 shadow-card">
                <Avatar name={doctor.name} className="size-[72px] text-xl sm:size-[88px] sm:text-2xl" />
              </span>
              <div className="min-w-0 pb-1">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{doctor.name}</h1>
                <Badge tone="primary" className="mt-1">
                  {doctor.specialization}
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil /> Edit
                </Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive-soft" onClick={() => setDeleting(true)}>
                  <Trash2 /> Delete
                </Button>
              </div>
            )}
          </div>

          <ul className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {contact.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <Icon className="size-4 shrink-0" aria-hidden />
                {href ? (
                  <a href={href} className="truncate hover:text-primary hover:underline">
                    {label}
                  </a>
                ) : (
                  <span className="truncate">{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid border-t sm:grid-cols-[200px_1fr]">
        <div className="border-b px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Total patients</p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{formatNumber(total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Last admission {formatDate(stats.lastAdmission)}</p>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Patients by condition</p>
          {total > 0 ? (
            <>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label="Condition distribution">
                {CONDITIONS.map((c) => {
                  const count = stats.byCondition[c.value] ?? 0;
                  return count ? <div key={c.value} style={{ width: `${(count / total) * 100}%`, background: c.color }} title={`${c.label}: ${count}`} /> : null;
                })}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {CONDITIONS.map((c) => (
                  <li key={c.value} className="flex items-center gap-1.5 text-sm">
                    <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-semibold tabular-nums">{stats.byCondition[c.value] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No patients assigned yet.</p>
          )}
        </div>
      </div>

      <DoctorFormDialog open={editing} doctor={doctor} onClose={() => setEditing(false)} />
      <DeleteDoctorDialog
        doctor={deleting ? doctor : null}
        patientCount={total}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.replace("/doctors")}
      />
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-24 rounded-none" />
      <div className="space-y-3 p-6">
        <div className="flex items-end gap-4">
          <Skeleton className="-mt-12 size-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
    </Card>
  );
}
