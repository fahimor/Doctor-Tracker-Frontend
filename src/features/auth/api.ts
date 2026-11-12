"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHydrated } from "@/hooks/use-hydrated";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/api";

export function useSession() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => api<{ data: { user: User } }>("/auth/me", { signal }).then((r) => r.data.user),
    staleTime: 5 * 60_000,
  });
  // The page shell is prerendered without a session. Parts of it can hydrate
  // after this query has already resolved (selective hydration), so expose the
  // user only once hydration is done — otherwise the HTML would not match.
  const hydrated = useHydrated();
  const user = hydrated ? query.data : undefined;
  return { ...query, isLoading: query.isLoading || !hydrated, user, isAdmin: user?.role === "admin" };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api<{ data: { user: User } }>("/auth/login", { method: "POST", body }).then((r) => r.data.user),
    onSuccess: (user) => {
      queryClient.clear(); // never show a previous user's cached data
      queryClient.setQueryData(queryKeys.session, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      // Full navigation so the proxy re-evaluates the (now cleared) cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    },
  });
}
