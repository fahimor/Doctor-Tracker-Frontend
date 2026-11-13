"use client";

import { SearchX, Stethoscope, UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, ProgressBar } from "@/components/ui/feedback";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { useSession } from "@/features/auth/api";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { DEFAULT_PAGE_SIZE, DOCTOR_SORT_OPTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { DoctorListItem } from "@/types/api";
import { useDoctorFacets, useDoctors } from "./api";
import { DeleteDoctorDialog } from "./delete-doctor-dialog";
import { DoctorFormDialog } from "./doctor-form-dialog";
import { DoctorsTable, DoctorsTableSkeleton } from "./doctors-table";

const DEFAULTS = {
  page: "1",
  limit: String(DEFAULT_PAGE_SIZE),
  q: "",
  specialization: "",
  hospital: "",
  from: "",
  to: "",
  sort: "newest",
};

export function DoctorsView() {
  const { isAdmin } = useSession();
  const { values: f, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const params = useMemo(() => ({ ...f, page: Number(f.page) || 1, limit: Number(f.limit) || DEFAULT_PAGE_SIZE }), [f]);

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useDoctors(params);
  const { data: facets } = useDoctorFacets();

  const [formState, setFormState] = useState<{ open: boolean; doctor?: DoctorListItem }>({ open: false });
  const [toDelete, setToDelete] = useState<DoctorListItem | null>(null);

  const onEdit = useCallback((doctor: DoctorListItem) => setFormState({ open: true, doctor }), []);
  const onDelete = useCallback((doctor: DoctorListItem) => setToDelete(doctor), []);
  const onPageChange = useCallback((page: number) => setFilters({ page: String(page) }), [setFilters]);
  const onLimitChange = useCallback((limit: number) => setFilters({ limit: String(limit) }), [setFilters]);
  const onSortChange = useCallback((sort: string) => setFilters({ sort }), [setFilters]);

  const hasFilters = activeCount > 0 || Boolean(f.q);

  return (
    <>
      <PageHeader
        title="Doctors"
        description={data ? `${formatNumber(data.meta.total)} doctors${hasFilters ? " matching your filters" : " in the network"}` : "Manage doctors and their patients"}
        actions={
          isAdmin && (
            <Button onClick={() => setFormState({ open: true })}>
              <UserPlus />
              Add doctor
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <FilterBar
          activeCount={activeCount}
          onReset={resetFilters}
          search={<SearchInput value={f.q} onChange={(q) => setFilters({ q })} placeholder="Search name, specialization, hospital, email…" label="Search doctors" />}
          sort={
            <Select value={f.sort} onChange={(e) => setFilters({ sort: e.target.value })} aria-label="Sort doctors">
              {DOCTOR_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          }
        >
          <FilterField label="Specialization" htmlFor="f-spec">
            <Select id="f-spec" value={f.specialization} onChange={(e) => setFilters({ specialization: e.target.value })}>
              <option value="">All specializations</option>
              {facets?.specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Hospital" htmlFor="f-hospital">
            <Select id="f-hospital" value={f.hospital} onChange={(e) => setFilters({ hospital: e.target.value })}>
              <option value="">All hospitals</option>
              {facets?.hospitals.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Joined from" htmlFor="f-from">
            <Input id="f-from" type="date" value={f.from} max={f.to || undefined} onChange={(e) => setFilters({ from: e.target.value })} />
          </FilterField>
          <FilterField label="Joined to" htmlFor="f-to">
            <Input id="f-to" type="date" value={f.to} min={f.from || undefined} onChange={(e) => setFilters({ to: e.target.value })} />
          </FilterField>
        </FilterBar>

        <ProgressBar active={isFetching && !isPending} />

        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {isPending ? (
            <DoctorsTableSkeleton />
          ) : isError ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No doctors match your filters"
                description="Try a different search term or clear some filters."
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Stethoscope}
                title="No doctors yet"
                description="Add your first doctor to start tracking patients."
                action={
                  isAdmin && (
                    <Button onClick={() => setFormState({ open: true })}>
                      <UserPlus /> Add doctor
                    </Button>
                  )
                }
              />
            )
          ) : (
            <>
              <DoctorsTable doctors={data.data} canEdit={isAdmin} onEdit={onEdit} onDelete={onDelete} sort={f.sort} onSortChange={onSortChange} />
              <Pagination meta={data.meta} onPageChange={onPageChange} onLimitChange={onLimitChange} noun="doctors" />
            </>
          )}
        </div>
      </Card>

      <DoctorFormDialog open={formState.open} doctor={formState.doctor} onClose={() => setFormState({ open: false })} />
      <DeleteDoctorDialog doctor={toDelete} onClose={() => setToDelete(null)} />
    </>
  );
}
