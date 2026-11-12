import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { DoctorRoute } from "./doctor-route";

export const metadata: Metadata = { title: "Doctor" };

export default function DoctorPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <DoctorRoute />
    </Suspense>
  );
}
