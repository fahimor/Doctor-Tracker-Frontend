"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DoctorDetail, DoctorFacets, DoctorListItem, DoctorSummary, Paginated } from "@/types/api";

export interface DoctorListParams {
  page: number;
  limit: number;
  q?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export interface DoctorInput {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

const fetchDoctors = (params: DoctorListParams, signal?: AbortSignal) =>
  api<Paginated<DoctorListItem>>("/doctors", { query: { ...params }, signal });

export function useDoctors(params: DoctorListParams) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.doctors.list({ ...params }),
    queryFn: ({ signal }) => fetchDoctors(params, signal),
    // Keep showing the current page while the next one loads (no layout flash).
    placeholderData: (previous) => previous, // keep showing old data while new data loads
  });

  // Prefetch the next page so "Next" feels instant.
  const hasNext = query.data?.meta.hasNextPage;
  useEffect(() => {
    if (!hasNext) return;
    const next = { ...params, page: params.page + 1 };
    void queryClient.prefetchQuery({ queryKey: queryKeys.doctors.list(next), queryFn: ({ signal }) => fetchDoctors(next, signal) });
  }, [hasNext, params, queryClient]);

  return query;
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: ({ signal }) => api<{ data: DoctorDetail }>(`/doctors/${id}`, { signal }).then((r) => r.data),
  });
}

export function useDoctorFacets() {
  return useQuery({
    queryKey: queryKeys.doctors.facets,
    queryFn: ({ signal }) => api<{ data: DoctorFacets }>("/doctors/facets", { signal }).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorOptions(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors.options(q),
    queryFn: ({ signal }) =>
      api<{ data: DoctorSummary[] }>("/doctors/options", { query: { q, limit: 20 }, signal }).then((r) => r.data),
    enabled,
    placeholderData: (previous) => previous, // keep showing old data while new data loads
    staleTime: 60_000,
  });
}

/** After any doctor write, refresh every doctor query plus dependent views. */
function useInvalidateDoctors() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: (body: DoctorInput) => api<{ data: DoctorDetail }>("/doctors", { method: "POST", body }).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: (body: Partial<DoctorInput>) =>
      api<{ data: DoctorDetail }>(`/doctors/${id}`, { method: "PATCH", body }).then((r) => r.data),
    onSuccess: (doctor) => {
      queryClient.setQueryData(queryKeys.doctors.detail(id), doctor);
      // Patient rows embed the doctor's name, so refresh them too.
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      return invalidate();
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ data: { deletedPatients: number } }>(`/doctors/${id}`, { method: "DELETE" }).then((r) => r.data),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.doctors.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      return invalidate();
    },
  });
}
