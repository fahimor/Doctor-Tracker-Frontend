import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden />;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start px-6 py-12 sm:px-8", className)}>
      <Icon className="mb-3 size-7 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-start px-6 py-12 sm:px-8", className)}>
      <AlertTriangle className="mb-3 size-7 text-destructive" strokeWidth={1.5} aria-hidden />
      <h3 className="text-base font-bold">Couldn&apos;t load this data</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Thin indeterminate bar shown while a background refetch is running. */
export function ProgressBar({ active }: { active: boolean }) {
  return (
    <div className="relative h-0.5 overflow-hidden" aria-hidden>
      {active && <div className="absolute inset-y-0 w-2/5 animate-progress rounded-full bg-primary" />}
    </div>
  );
}
