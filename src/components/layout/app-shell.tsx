"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { AccountMenu, RailUser } from "./account";

/**
 * Desktop: a ward-green rail whose active nav item is a folder tab running
 * into the page. Mobile: a slim top bar plus a bottom tab bar — with only
 * three destinations, tabs beat a hidden hamburger menu.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-[5px] bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-rail lg:flex">
        <Link href="/dashboard" className="block px-6 pt-7 pb-10 text-[28px] text-rail-foreground">
          <Logo />
        </Link>
        <div className="flex-1 pl-3">
          <SidebarNav variant="rail" />
        </div>
        <RailUser />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-rail px-4 lg:hidden">
        <Link href="/dashboard" className="text-xl text-rail-foreground" aria-label="Doctor Tracker home">
          <Logo inline />
        </Link>
        <AccountMenu />
      </header>

      <main id="main" className="pb-24 lg:pb-0 lg:pl-60">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        <SidebarNav variant="bar" />
      </div>
    </div>
  );
}
