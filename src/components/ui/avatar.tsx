import { cn, initials } from "@/lib/utils";

// Deterministic colour per name so the same person always gets the same avatar.
const palette = [
  "bg-[color-mix(in_oklch,var(--chart-1)_18%,transparent)] text-[color-mix(in_oklch,var(--chart-1)_80%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-2)_18%,transparent)] text-[color-mix(in_oklch,var(--chart-2)_80%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-3)_22%,transparent)] text-[color-mix(in_oklch,var(--chart-3)_60%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-4)_18%,transparent)] text-[color-mix(in_oklch,var(--chart-4)_80%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-5)_18%,transparent)] text-[color-mix(in_oklch,var(--chart-5)_75%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-6)_18%,transparent)] text-[color-mix(in_oklch,var(--chart-6)_80%,var(--foreground))]",
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-wide select-none",
        palette[hash(name) % palette.length],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
