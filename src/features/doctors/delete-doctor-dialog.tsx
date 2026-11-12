"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { pluralize } from "@/lib/utils";
import type { Doctor } from "@/types/api";
import { useDeleteDoctor } from "./api";

interface DeleteDoctorDialogProps {
  doctor: (Doctor & { patientCount?: number }) | null;
  patientCount?: number;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteDoctorDialog({ doctor, patientCount, onClose, onDeleted }: DeleteDoctorDialogProps) {
  const remove = useDeleteDoctor();
  const count = patientCount ?? doctor?.patientCount ?? 0;

  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      title="Delete doctor?"
      confirmLabel="Delete doctor"
      loading={remove.isPending}
      onClose={onClose}
      onConfirm={() => {
        if (!doctor) return;
        remove.mutate(doctor._id, {
          onSuccess: ({ deletedPatients }) => {
            toast.success(`${doctor.name} deleted${deletedPatients ? ` with ${pluralize(deletedPatients, "patient")}` : ""}`);
            onClose();
            onDeleted?.();
          },
          onError: (err) => toast.error(err.message),
        });
      }}
      description={
        <>
          <span className="font-semibold text-foreground">{doctor?.name}</span> will be permanently removed.
          {count > 0 && (
            <span className="mt-3 block rounded-lg border border-destructive/25 bg-destructive-soft px-3 py-2 font-medium text-destructive">
              Their {pluralize(count, "patient")} will also be deleted.
            </span>
          )}
        </>
      }
    />
  );
}
