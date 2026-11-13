import { cn } from "@/lib/utils";

/**
 * Typographic wordmark: condensed Archivo, stacked, with a small ward-green
 * block standing in for a file tab. No pictogram needed.
 */
export function Logo({ className, inline = false }: { className?: string; inline?: boolean }) {
  return (
    <span className={cn("font-display inline-flex items-center gap-2 leading-[0.9] font-extrabold", className)}>
      <span className="h-[1.6em] w-[0.35em] shrink-0 rounded-[2px] bg-[#3fb489]" aria-hidden />
      {inline ? (
        <span>Doctor Tracker</span>
      ) : (
        <span>
          Doctor
          <br />
          Tracker
        </span>
      )}
    </span>
  );
}
