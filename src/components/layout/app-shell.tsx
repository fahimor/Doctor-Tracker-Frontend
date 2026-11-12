"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserCard } from "./user-card";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Link href="/dashboard" onClick={onNavigate} className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 px-3">
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">Menu</p>
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <div className="space-y-3 border-t p-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <UserCard />
      </div>
    </div>
  );
}

/** Responsive layout: fixed sidebar on desktop, slide-in drawer on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  // Links inside the drawer call `onNavigate` to close it.
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" aria-label="Doctor Tracker home">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", !drawerOpen && "pointer-events-none")} aria-hidden={!drawerOpen}>
        <div
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          id="mobile-nav"
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r bg-sidebar shadow-pop transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
          inert={!drawerOpen}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute top-5 right-3 rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
          <SidebarContent onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      <main id="main" className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
