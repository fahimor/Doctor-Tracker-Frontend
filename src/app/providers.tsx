"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api-client";

let redirectingToLogin = false;

/**
 * Any 401 means the session expired or was revoked (e.g. the user was deleted).
 * Clear the cookie first — otherwise the proxy would still see a well-formed
 * token and bounce us straight back — then reload into the login page.
 */
function handleUnauthorized(error: unknown) {
  if (!(error instanceof ApiError) || !error.isUnauthorized) return;
  if (redirectingToLogin || window.location.pathname === "/login") return;
  redirectingToLogin = true;

  const next = encodeURIComponent(window.location.pathname + window.location.search);
  void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
    .catch(() => undefined)
    .finally(() => {
      // A full page load (not router.push) wipes all in-memory state from the old session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${next}&expired=1`);
    });
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 30_000, // treat data as fresh for 30s -> no refetch on every navigation
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // Retry transient server/network errors only; 4xx errors will not fix themselves.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.status > 0 && error.status < 500 ? false : failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session (useState keeps it stable across renders).
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
