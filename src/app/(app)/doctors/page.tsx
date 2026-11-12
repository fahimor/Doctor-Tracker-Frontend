import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { DoctorsTableSkeleton } from "@/features/doctors/doctors-table";
import { DoctorsView } from "@/features/doctors/doctors-view";

export const metadata: Metadata = { title: "Doctors" };

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <Card className="mt-16 overflow-hidden">
          <DoctorsTableSkeleton />
        </Card>
      }
    >
      <DoctorsView />
    </Suspense>
  );
}
