"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DashboardRange, DashboardStats } from "@/types/api";

export function useDashboardStats(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(range),
    queryFn: ({ signal }) => api<{ data: DashboardStats }>("/dashboard/stats", { query: { range }, signal }).then((r) => r.data),
    placeholderData: (previous) => previous, // keep showing old data while new data loads
    staleTime: 60_000,
  });
}
