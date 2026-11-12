"use client";

import { SearchX, UserPlus, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, ProgressBar } from "@/components/ui/feedback";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { useSession } from "@/features/auth/api";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { CONDITIONS, DEFAULT_PAGE_SIZE, GENDERS, PATIENT_SORT_OPTIONS } from "@/lib/constants";
import type { DoctorSummary, Patient } from "@/types/api";
import { useDeletePatient, usePatients } from "./api";
import { PatientFormDialog } from "./patient-form-dialog";
import { PatientsTable, PatientsTableSkeleton } from "./patients-table";

const DEFAULTS = {
  page: "1",
  limit: String(DEFAULT_PAGE_SIZE),
  q: "",
  condition: "",
  gender: "",
  from: "",
  to: "",
  minAge: "",
  maxAge: "",
  sort: "admission_desc",
};

interface PatientsViewProps {
  /** Scope the list to one doctor (doctor detail page). */
  doctor?: DoctorSummary;
  /** Render the "Add patient" button in the card header. */
  showAddButton?: boolean;
}

export function PatientsView({ doctor, showAddButton = false }: PatientsViewProps) {
  const { isAdmin } = useSession();
  const { values: f, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);

  // Memoised so the query key / prefetch effect only change when filters do.
  const params = useMemo(
    () => ({ ...f, page: Number(f.page) || 1, limit: Number(f.limit) || DEFAULT_PAGE_SIZE, doctor: doctor?._id }),
    [f, doctor?._id],
  );
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = usePatients(params);

  const [formState, setFormState] = useState<{ open: boolean; patient?: Patient }>({ open: false });
  const [toDelete, setToDelete] = useState<Patient | null>(null);
  const deletePatient = useDeletePatient();

  // Stable callbacks keep memoised table rows from re-rendering.
  const onEdit = useCallback((patient: Patient) => setFormState({ open: true, patient }), []);
  const onDelete = useCallback((patient: Patient) => setToDelete(patient), []);
  const onPageChange = useCallback((page: number) => setFilters({ page: String(page) }), [setFilters]);
  const onLimitChange = useCallback((limit: number) => setFilters({ limit: String(limit) }), [setFilters]);

  const confirmDelete = () => {
    if (!toDelete) return;
    deletePatient.mutate(
      { id: toDelete._id, doctorId: doctor?._id },
      {
        onSuccess: () => {
          toast.success(`${toDelete.name} was removed`);
          setToDelete(null);
          // Step back a page if we just deleted the last row on this page.
          if (data && data.data.length === 1 && params.page > 1) onPageChange(params.page - 1);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const hasFilters = activeCount > 0 || Boolean(f.q);

  return (
    <>
      <Card className="overflow-hidden">
        {showAddButton && (
          <div className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">Patients</h2>
              <p className="text-sm text-muted-foreground">
                {data ? `${data.meta.total} ${data.meta.total === 1 ? "patient" : "patients"}` : "Loading…"}
                {hasFilters && " matching filters"}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setFormState({ open: true })}>
                <UserPlus />
                <span className="hidden sm:inline">Add patient</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        )}

        <FilterBar
          activeCount={activeCount}
          onReset={resetFilters}
          search={
            <SearchInput
              value={f.q}
              onChange={(q) => setFilters({ q })}
              placeholder="Search name, phone, email or diagnosis…"
              label="Search patients"
            />
          }
          sort={
            <Select value={f.sort} onChange={(e) => setFilters({ sort: e.target.value })} aria-label="Sort patients">
              {PATIENT_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          }
        >
          <FilterField label="Condition" htmlFor="f-condition">
            <Select id="f-condition" value={f.condition} onChange={(e) => setFilters({ condition: e.target.value })}>
              <option value="">All conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Gender" htmlFor="f-gender">
            <Select id="f-gender" value={f.gender} onChange={(e) => setFilters({ gender: e.target.value })}>
              <option value="">Any gender</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Admitted from" htmlFor="f-from">
            <Input id="f-from" type="date" value={f.from} max={f.to || undefined} onChange={(e) => setFilters({ from: e.target.value })} />
          </FilterField>
          <FilterField label="Admitted to" htmlFor="f-to">
            <Input id="f-to" type="date" value={f.to} min={f.from || undefined} onChange={(e) => setFilters({ to: e.target.value })} />
          </FilterField>
          <FilterField label="Age range" htmlFor="f-min-age" className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Input id="f-min-age" type="number" min={0} max={130} placeholder="Min" value={f.minAge} onChange={(e) => setFilters({ minAge: e.target.value })} aria-label="Minimum age" />
              <span className="text-muted-foreground">–</span>
              <Input type="number" min={0} max={130} placeholder="Max" value={f.maxAge} onChange={(e) => setFilters({ maxAge: e.target.value })} aria-label="Maximum age" />
            </div>
          </FilterField>
        </FilterBar>

        <ProgressBar active={isFetching && !isPending} />

        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {isPending ? (
            <PatientsTableSkeleton />
          ) : isError ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No patients match your filters"
                description="Try a different search term or clear some filters."
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description={doctor ? `${doctor.name} has no patients assigned yet.` : "Patients you add will appear here."}
                action={
                  isAdmin && (
                    <Button onClick={() => setFormState({ open: true })}>
                      <UserPlus /> Add patient
                    </Button>
                  )
                }
              />
            )
          ) : (
            <>
              <PatientsTable patients={data.data} showDoctor={!doctor} canEdit={isAdmin} onEdit={onEdit} onDelete={onDelete} />
              <Pagination meta={data.meta} onPageChange={onPageChange} onLimitChange={onLimitChange} noun="patients" />
            </>
          )}
        </div>
      </Card>

      <PatientFormDialog
        open={formState.open}
        patient={formState.patient}
        fixedDoctor={formState.patient ? undefined : doctor}
        onClose={() => setFormState({ open: false })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete patient?"
        description={
          <>
            <span className="font-semibold text-foreground">{toDelete?.name}</span> will be permanently removed
            {toDelete?.doctor ? ` from ${toDelete.doctor.name}'s patient list` : ""}. This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete patient"
        loading={deletePatient.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
