"use client";

import { useParams } from "next/navigation";
import { DoctorDetailView } from "@/features/doctors/doctor-detail-view";

export function DoctorRoute() {
  const { id } = useParams<{ id: string }>();
  // `key` resets all local state (dialogs, filters) when moving between doctors.
  return <DoctorDetailView key={id} id={id} />;
}
