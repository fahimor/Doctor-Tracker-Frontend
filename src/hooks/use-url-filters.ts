"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type FilterValues = Record<string, string>;

/**
 * Filters, sorting and pagination live in the URL query string instead of
 * component state. That makes every view shareable and bookmarkable, keeps the
 * back button working, and gives TanStack Query a stable cache key.
 *
 * Any change other than `page` resets to page 1.
 */
export function useUrlFilters<T extends FilterValues>(defaults: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const values = useMemo(() => {
    const result = { ...defaults } as T;
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const fromUrl = searchParams.get(key as string);
      if (fromUrl !== null) result[key] = fromUrl as T[keyof T];
    }
    return result;
    // `defaults` is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "" || value === defaults[key]) next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, router, pathname],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  /** Number of filters that differ from their defaults (ignores paging/sort/search). */
  const activeCount = useMemo(
    () =>
      Object.keys(defaults).filter(
        (k) => !["page", "limit", "sort", "q"].includes(k) && values[k] !== defaults[k],
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values],
  );

  return { values, setFilters, resetFilters, activeCount };
}
