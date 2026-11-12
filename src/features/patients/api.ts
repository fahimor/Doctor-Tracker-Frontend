"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Gender, Paginated, Patient, PatientCondition } from "@/types/api";

export interface PatientListParams {
  page: number;
  limit: number;
  q?: string;
  condition?: string;
  gender?: string;
  doctor?: string;
  from?: string;
  to?: string;
  minAge?: string;
  maxAge?: string;
  sort?: string;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  diagnosis: string;
  condition: PatientCondition;
  admissionDate: string;
  notes?: string;
  doctor?: string;
}

/**
 * When `doctorId` is set, the list is scoped to that doctor via the nested
 * route `/doctors/:id/patients`; otherwise it uses `/patients`.
 */
const fetchPatients = (params: PatientListParams, signal?: AbortSignal) => {
  const { doctor, ...rest } = params;
  const path = doctor ? `/doctors/${doctor}/patients` : "/patients";
  return api<Paginated<Patient>>(path, { query: { ...rest }, signal });
};

export function usePatients(params: PatientListParams) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.patients.list({ ...params }),
    queryFn: ({ signal }) => fetchPatients(params, signal),
    placeholderData: (previous) => previous, // keep showing old data while new data loads
  });

  const hasNext = query.data?.meta.hasNextPage;
  useEffect(() => {
    if (!hasNext) return;
    const next = { ...params, page: params.page + 1 };
    void queryClient.prefetchQuery({ queryKey: queryKeys.patients.list(next), queryFn: ({ signal }) => fetchPatients(next, signal) });
  }, [hasNext, params, queryClient]);

  return query;
}

/** Patient writes affect patient lists, doctor patient counts/stats and the dashboard. */
function useInvalidatePatients() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: ({ doctor, ...body }: PatientInput & { doctor: string }) =>
      api<{ data: Patient }>(`/doctors/${doctor}/patients`, { method: "POST", body }).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<PatientInput> & { id: string }) =>
      api<{ data: Patient }>(`/patients/${id}`, { method: "PATCH", body }).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    /** Pass `doctorId` to delete through the doctor's own patient list route. */
    mutationFn: ({ id, doctorId }: { id: string; doctorId?: string }) =>
      api<void>(doctorId ? `/doctors/${doctorId}/patients/${id}` : `/patients/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
