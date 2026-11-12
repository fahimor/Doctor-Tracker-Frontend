import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { AddPatientButton } from "@/features/patients/add-patient-button";
import { PatientsTableSkeleton } from "@/features/patients/patients-table";
import { PatientsView } from "@/features/patients/patients-view";

export const metadata: Metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Search, filter and manage every patient across all doctors."
        actions={<AddPatientButton />}
      />
      <Suspense
        fallback={
          <Card className="overflow-hidden">
            <PatientsTableSkeleton />
          </Card>
        }
      >
        <PatientsView />
      </Suspense>
    </>
  );
}
