"use client";

import { LayoutDashboard, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
] as const;

type Variant = "rail" | "bar";

function isActive(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

function NavLinks({ pathname, variant }: { pathname: string | null; variant: Variant }) {
  if (variant === "bar") {
    return (
      <nav aria-label="Main" className="grid grid-cols-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-xs",
                active ? "font-bold text-primary" : "text-muted-foreground",
              )}
            >
              {active && <span className="absolute inset-x-6 top-0 h-0.5 bg-primary" aria-hidden />}
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Desktop: folder tabs. The active tab takes the page colour and runs into
  // the content sheet, like the tab of an open case file.
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-l-[6px] py-2.5 pr-4 pl-4 text-[15px] transition-colors",
              active ? "bg-background font-bold text-foreground" : "text-rail-muted hover:bg-white/5 hover:text-rail-foreground",
            )}
          >
            <Icon className={cn("size-[18px]", active && "text-primary")} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavLinks({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  return <NavLinks pathname={pathname} variant={variant} />;
}

/**
 * The current path is request data, so only the "which link is active" part
 * sits behind Suspense. The links themselves are in the prerendered shell.
 */
export function SidebarNav({ variant = "rail" }: { variant?: Variant }) {
  return (
    <Suspense fallback={<NavLinks pathname={null} variant={variant} />}>
      <ActiveNavLinks variant={variant} />
    </Suspense>
  );
}
