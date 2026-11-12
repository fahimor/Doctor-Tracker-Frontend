"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SPECIALIZATION_SUGGESTIONS } from "@/lib/constants";
import { handleFormError, phoneRegex } from "@/lib/form";
import type { Doctor } from "@/types/api";
import { useCreateDoctor, useDoctorFacets, useUpdateDoctor, type DoctorInput } from "./api";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  specialization: z.string().trim().min(2, "Specialization is required").max(80),
  hospital: z.string().trim().min(2, "Hospital is required").max(160),
  phone: z.string().trim().min(6, "Phone number is too short").max(20).regex(phoneRegex, "Only digits, spaces, +, - and ( )"),
  email: z.email("Enter a valid email address").trim().max(160),
});
const FIELDS = Object.keys(schema.shape);

interface DoctorFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pass a doctor to edit; omit to create. */
  doctor?: Doctor;
  onCreated?: (doctor: Doctor) => void;
}

export function DoctorFormDialog({ open, onClose, doctor, onCreated }: DoctorFormDialogProps) {
  const isEdit = Boolean(doctor);
  const create = useCreateDoctor();
  const update = useUpdateDoctor(doctor?._id ?? "");
  const pending = create.isPending || update.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!pending}
      title={isEdit ? "Edit doctor" : "Add a doctor"}
      description={isEdit ? "Update this doctor's profile." : "Create a doctor profile. You can add patients right after."}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" loading={pending}>
            {isEdit ? "Save changes" : "Create doctor"}
          </Button>
        </>
      }
    >
      <DoctorForm
        doctor={doctor}
        onSubmit={async (values, setError) => {
          try {
            if (doctor) {
              await update.mutateAsync(values);
              toast.success("Doctor updated");
            } else {
              const created = await create.mutateAsync(values);
              toast.success(`${created.name} added`);
              onCreated?.(created);
            }
            onClose();
          } catch (error) {
            handleFormError(error, setError, FIELDS);
          }
        }}
      />
    </Dialog>
  );
}

function DoctorForm({
  doctor,
  onSubmit,
}: {
  doctor?: Doctor;
  onSubmit: (values: DoctorInput, setError: UseFormSetError<DoctorInput>) => Promise<void>;
}) {
  const { data: facets } = useDoctorFacets();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DoctorInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: doctor?.name ?? "",
      specialization: doctor?.specialization ?? "",
      hospital: doctor?.hospital ?? "",
      phone: doctor?.phone ?? "",
      email: doctor?.email ?? "",
    },
  });

  const specializations = [...new Set([...SPECIALIZATION_SUGGESTIONS, ...(facets?.specializations ?? [])])].sort();

  return (
    <form id="doctor-form" noValidate onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor="d-name" error={errors.name?.message} required className="sm:col-span-2">
        <Input placeholder="Dr. Nusrat Rahman" autoComplete="off" autoFocus {...fieldAria("d-name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Specialization" htmlFor="d-spec" error={errors.specialization?.message} required>
        <Input list="specialization-options" placeholder="Cardiology" autoComplete="off" {...fieldAria("d-spec", errors.specialization?.message)} {...register("specialization")} />
        <datalist id="specialization-options">
          {specializations.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label="Hospital" htmlFor="d-hospital" error={errors.hospital?.message} required>
        <Input list="hospital-options" placeholder="Square Hospital" autoComplete="off" {...fieldAria("d-hospital", errors.hospital?.message)} {...register("hospital")} />
        <datalist id="hospital-options">
          {facets?.hospitals.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </Field>

      <Field label="Phone" htmlFor="d-phone" error={errors.phone?.message} required>
        <Input type="tel" placeholder="+880 1712 345678" autoComplete="off" {...fieldAria("d-phone", errors.phone?.message)} {...register("phone")} />
      </Field>

      <Field label="Email" htmlFor="d-email" error={errors.email?.message} required>
        <Input type="email" placeholder="doctor@hospital.com" autoComplete="off" {...fieldAria("d-email", errors.email?.message)} {...register("email")} />
      </Field>
    </form>
  );
}
