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

interface NavProps {
  onNavigate?: () => void;
}

function NavLinks({ pathname, onNavigate }: NavProps & { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active ? "bg-primary-soft text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon
              className={cn("size-[18px] transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavLinks(props: NavProps) {
  const pathname = usePathname();
  return <NavLinks {...props} pathname={pathname} />;
}

/**
 * The current path is request data, so only the "which link is active" part
 * sits behind Suspense. The links themselves are in the prerendered shell.
 */
export function SidebarNav(props: NavProps) {
  return (
    <Suspense fallback={<NavLinks {...props} pathname={null} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}
