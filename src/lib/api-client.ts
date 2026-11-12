import type { ApiErrorBody } from "@/types/api";

/** Error thrown for any non-2xx API response (or network failure). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

/** Drops empty values so URLs stay clean and cache keys stay stable. */
export function toSearchParams(query: Record<string, QueryValue> = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Thin fetch wrapper for the backend. Requests go to this app's own origin
 * (`/api/...`) and are proxied to the Express API by a Next.js rewrite, so the
 * httpOnly session cookie is sent automatically.
 */
export async function api<T>(path: string, { method = "GET", body, query, signal }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}${toSearchParams(query)}`, {
      method,
      signal,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  const payload = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? (res.status >= 500 ? "The server had a problem. Please try again." : "Request failed"),
      error?.details,
    );
  }

  return payload as T;
}
