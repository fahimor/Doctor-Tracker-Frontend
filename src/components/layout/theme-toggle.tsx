"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const;

/** `onRail` styles it for the dark navigation rail. */
export function ThemeToggle({ className, onRail = false }: { className?: string; onRail?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated(); // the theme is unknown on the server

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex rounded-[5px] p-0.5", onRail ? "bg-white/8" : "bg-muted", className)}
    >
      {options.map(({ value, icon: Icon, label }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-[4px] transition-colors",
              onRail
                ? active
                  ? "bg-white/15 text-rail-foreground"
                  : "text-rail-muted hover:text-rail-foreground"
                : active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
