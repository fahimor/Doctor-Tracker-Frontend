"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/api";
import { PatientFormDialog } from "./patient-form-dialog";

/** Page-header action; hidden for read-only (viewer) accounts. */
export function AddPatientButton() {
  const { isAdmin } = useSession();
  const [open, setOpen] = useState(false);
  if (!isAdmin) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus />
        Add patient
      </Button>
      <PatientFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
