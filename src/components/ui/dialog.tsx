"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Prevent closing (e.g. while a request is in flight). */
  dismissible?: boolean;
}

const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

/**
 * Modal built on the native <dialog> element: the browser handles the top
 * layer, focus trapping, inert background and the Escape key for us.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault(); // keep React state as the source of truth
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        // Clicking the backdrop (the <dialog> element itself) closes it.
        if (e.target === e.currentTarget && dismissible) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-2xl border bg-card p-0 text-card-foreground shadow-pop backdrop:bg-transparent",
        "max-h-[calc(100dvh-2rem)] overflow-hidden open:animate-dialog-in",
        widths[size],
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b px-6 py-4">
            <div>
              <h2 id={titleId} className="text-base font-semibold tracking-tight">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={!dismissible}
              className="-mr-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
