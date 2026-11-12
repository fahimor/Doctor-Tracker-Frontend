/**
 * Central query-key factory. Keys are hierarchical, so invalidating
 * `queryKeys.doctors.all` refetches every doctor list, detail and facet.
 */
export const queryKeys = {
  session: ["session"] as const,
  dashboard: {
    all: ["dashboard"] as const,
    stats: (range: string) => ["dashboard", "stats", range] as const,
  },
  doctors: {
    all: ["doctors"] as const,
    list: (params: Record<string, unknown>) => ["doctors", "list", params] as const,
    detail: (id: string) => ["doctors", "detail", id] as const,
    facets: ["doctors", "facets"] as const,
    options: (q: string) => ["doctors", "options", q] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (params: Record<string, unknown>) => ["patients", "list", params] as const,
  },
};
