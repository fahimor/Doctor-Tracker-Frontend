"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, fieldAria } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DoctorCombobox } from "@/features/doctors/doctor-combobox";
import { CONDITIONS, GENDERS } from "@/lib/constants";
import { handleFormError, phoneRegex } from "@/lib/form";
import { cn, toDateInputValue, todayInputValue } from "@/lib/utils";
import type { DoctorSummary, Patient } from "@/types/api";
import { useCreatePatient, useUpdatePatient } from "./api";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  age: z.number({ error: "Enter an age" }).int("Age must be a whole number").min(0, "Age can't be negative").max(130, "Age looks too high"),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  phone: z.string().trim().min(6, "Phone number is too short").max(20).regex(phoneRegex, "Only digits, spaces, +, - and ( )"),
  email: z.union([z.literal(""), z.email("Enter a valid email address").trim().max(160)]),
  diagnosis: z.string().trim().min(2, "Diagnosis is required").max(160),
  condition: z.enum(["stable", "critical", "recovering", "under_observation", "discharged"]),
  admissionDate: z
    .string()
    .min(1, "Admission date is required")
    .refine((v) => v <= todayInputValue(), "Admission date can't be in the future"),
  notes: z.string().trim().max(1000),
  doctor: z.custom<DoctorSummary | null>().refine((d) => Boolean(d), "Select a doctor"),
});
type FormValues = z.infer<typeof schema>;
const FIELDS = Object.keys(schema.shape);

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Edit this patient; omit to create. */
  patient?: Patient;
  /** Lock the doctor (when adding from a doctor's page). */
  fixedDoctor?: DoctorSummary;
}

export function PatientFormDialog({ open, onClose, patient, fixedDoctor }: PatientFormDialogProps) {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const pending = create.isPending || update.isPending;

  const submit = async (values: FormValues, setError: UseFormSetError<FormValues>) => {
    const { doctor, email, notes, ...rest } = values;
    const body = { ...rest, email: email || undefined, notes: notes || undefined, doctor: doctor!._id };
    try {
      if (patient) {
        await update.mutateAsync({ id: patient._id, ...body });
        toast.success("Patient updated");
      } else {
        await create.mutateAsync(body);
        toast.success(`${values.name} added to ${doctor!.name}`);
      }
      onClose();
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!pending}
      size="lg"
      title={patient ? "Edit patient" : "Add a patient"}
      description={
        fixedDoctor ? (
          <>
            Under the care of <span className="font-semibold text-foreground">{fixedDoctor.name}</span>
          </>
        ) : patient ? (
          "Update the patient's details, condition or assigned doctor."
        ) : (
          "Register a patient and assign them to a doctor."
        )
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" loading={pending}>
            {patient ? "Save changes" : "Add patient"}
          </Button>
        </>
      }
    >
      <PatientForm patient={patient} fixedDoctor={fixedDoctor} onSubmit={submit} />
    </Dialog>
  );
}

function PatientForm({
  patient,
  fixedDoctor,
  onSubmit,
}: {
  patient?: Patient;
  fixedDoctor?: DoctorSummary;
  onSubmit: (values: FormValues, setError: UseFormSetError<FormValues>) => Promise<void>;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: patient?.name ?? "",
      age: patient?.age,
      gender: patient?.gender,
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      diagnosis: patient?.diagnosis ?? "",
      condition: patient?.condition ?? "stable",
      admissionDate: patient ? toDateInputValue(patient.admissionDate) : todayInputValue(),
      notes: patient?.notes ?? "",
      doctor: fixedDoctor ?? patient?.doctor ?? null,
    },
  });

  return (
    <form id="patient-form" noValidate onSubmit={handleSubmit((v) => onSubmit(v, setError))} className="grid gap-4 sm:grid-cols-6">
      <Field label="Full name" htmlFor="p-name" error={errors.name?.message} required className="sm:col-span-4">
        <Input placeholder="Ayesha Rahman" autoComplete="off" autoFocus {...fieldAria("p-name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Age" htmlFor="p-age" error={errors.age?.message} required className="sm:col-span-2">
        <Input type="number" inputMode="numeric" min={0} max={130} placeholder="42" {...fieldAria("p-age", errors.age?.message)} {...register("age", { valueAsNumber: true })} />
      </Field>

      <Field label="Gender" htmlFor="p-gender" error={errors.gender?.message} required className="sm:col-span-2">
        <Select {...fieldAria("p-gender", errors.gender?.message)} {...register("gender")} defaultValue={patient?.gender ?? ""}>
          <option value="" disabled>
            Select…
          </option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Phone" htmlFor="p-phone" error={errors.phone?.message} required className="sm:col-span-2">
        <Input type="tel" placeholder="01712 345678" autoComplete="off" {...fieldAria("p-phone", errors.phone?.message)} {...register("phone")} />
      </Field>

      <Field label="Email" htmlFor="p-email" error={errors.email?.message} hint="Optional" className="sm:col-span-2">
        <Input type="email" placeholder="name@email.com" autoComplete="off" {...fieldAria("p-email", errors.email?.message)} {...register("email")} />
      </Field>

      <Field label="Diagnosis" htmlFor="p-diagnosis" error={errors.diagnosis?.message} required className="sm:col-span-4">
        <Input placeholder="Type 2 diabetes" autoComplete="off" {...fieldAria("p-diagnosis", errors.diagnosis?.message)} {...register("diagnosis")} />
      </Field>

      <Field label="Admission date" htmlFor="p-date" error={errors.admissionDate?.message} required className="sm:col-span-2">
        <Input type="date" max={todayInputValue()} {...fieldAria("p-date", errors.admissionDate?.message)} {...register("admissionDate")} />
      </Field>

      <fieldset className="sm:col-span-6">
        <legend className="mb-1.5 text-sm font-medium">
          Condition<span className="ml-0.5 text-destructive" aria-hidden>*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input type="radio" value={c.value} className="peer sr-only" {...register("condition")} />
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                  "peer-checked:border-transparent peer-checked:text-foreground peer-checked:ring-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-muted",
                )}
                style={{ ["--tw-ring-color" as string]: c.color }}
              >
                <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {!fixedDoctor && (
        <Field label="Assigned doctor" htmlFor="p-doctor" error={errors.doctor?.message} required className="sm:col-span-6">
          <Controller
            control={control}
            name="doctor"
            render={({ field, fieldState }) => (
              <DoctorCombobox
                id="p-doctor"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(fieldState.error)}
                describedBy={fieldState.error ? "p-doctor-error" : undefined}
              />
            )}
          />
        </Field>
      )}

      <Field label="Notes" htmlFor="p-notes" error={errors.notes?.message} hint="Optional — allergies, follow-ups, etc." className="sm:col-span-6">
        <Textarea rows={3} placeholder="Add any relevant clinical notes" {...fieldAria("p-notes", errors.notes?.message)} {...register("notes")} />
      </Field>
    </form>
  );
}
