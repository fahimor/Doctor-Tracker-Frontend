import type { Metadata } from "next";
import { Suspense } from "react";
import { CensusStripSkeleton } from "@/features/dashboard/census-strip";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    // The view reads the URL (?range=), so it renders inside a Suspense
    // boundary; everything outside it is part of the prerendered shell.
    <Suspense fallback={<CensusStripSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
