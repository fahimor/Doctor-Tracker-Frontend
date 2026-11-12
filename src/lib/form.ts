import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "./api-client";

/**
 * Shows server-side validation errors (400/409 with `details`) next to the
 * matching form fields, and anything else as a toast.
 */
export function handleFormError<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: readonly string[]) {
  if (error instanceof ApiError) {
    const fieldErrors = error.details.filter((d) => fields.includes(d.path));
    if (fieldErrors.length > 0) {
      fieldErrors.forEach((d, i) => setError(d.path as Path<T>, { type: "server", message: d.message }, { shouldFocus: i === 0 }));
      return;
    }
    toast.error(error.message);
    return;
  }
  toast.error("Something went wrong. Please try again.");
}

export const phoneRegex = /^\+?[\d\s()-]+$/;
