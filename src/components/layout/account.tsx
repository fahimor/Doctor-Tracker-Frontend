"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { useLogout, useSession } from "@/features/auth/api";
import { cn, initials } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const ROLE_LABEL = { admin: "Administrator", viewer: "Read-only access" } as const;

/** Signed-in user, theme and sign out, at the foot of the desktop rail. */
export function RailUser() {
  const { user } = useSession();
  const logout = useLogout();

  return (
    <div className="space-y-4 border-t border-white/10 px-4 py-4">
      {user ? (
        <div className="min-w-0">
          <p className="truncate font-bold text-rail-foreground">{user.name}</p>
          <p className="truncate text-[13px] text-rail-muted">{ROLE_LABEL[user.role]}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28 bg-white/10" />
          <Skeleton className="h-3 w-20 bg-white/10" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <ThemeToggle onRail />
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[13px] text-rail-muted transition-colors hover:bg-white/8 hover:text-rail-foreground disabled:opacity-50"
        >
          <LogOut className="size-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}

/** Mobile: initials button that opens a small account sheet. */
export function AccountMenu() {
  const { user } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account"
        className="flex size-9 items-center justify-center rounded-full bg-white/12 text-[13px] font-bold text-rail-foreground"
      >
        {user ? initials(user.name) : ""}
      </button>
      {open && (
        <div className="absolute top-11 right-0 z-50 w-64 animate-fade-in rounded-sheet border bg-card p-4 text-card-foreground shadow-pop">
          {user && (
            <div className="mb-4 min-w-0">
              <p className="truncate font-bold">{user.name}</p>
              <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className={cn("inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-sm font-semibold text-destructive hover:bg-destructive-soft")}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
