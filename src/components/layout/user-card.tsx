"use client";

import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { useLogout, useSession } from "@/features/auth/api";

export function UserCard() {
  const { user, isLoading } = useSession();
  const logout = useLogout();

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold">
          <span className="truncate">{user.name}</span>
          <Badge tone={user.role === "admin" ? "primary" : "neutral"} className="px-1.5 py-0 text-[10px] uppercase">
            {user.role}
          </Badge>
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
