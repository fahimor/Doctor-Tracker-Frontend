import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl shadow-sm",
          inverted ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-primary text-primary-foreground",
        )}
      >
        <HeartPulse className="size-5" aria-hidden />
      </span>
      <span className={cn("text-[15px] leading-tight font-bold tracking-tight", inverted ? "text-white" : "text-foreground")}>
        Doctor Tracker
        <span className={cn("block text-[11px] font-medium", inverted ? "text-white/70" : "text-muted-foreground")}>
          Clinical admin portal
        </span>
      </span>
    </span>
  );
}
