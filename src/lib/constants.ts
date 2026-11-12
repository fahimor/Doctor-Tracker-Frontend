import type { DashboardRange, Gender, PatientCondition } from "@/types/api";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export const CONDITIONS: { value: PatientCondition; label: string; tone: Tone; color: string }[] = [
  { value: "stable", label: "Stable", tone: "success", color: "var(--chart-5)" },
  { value: "recovering", label: "Recovering", tone: "primary", color: "var(--chart-1)" },
  { value: "under_observation", label: "Under observation", tone: "warning", color: "var(--chart-3)" },
  { value: "critical", label: "Critical", tone: "danger", color: "var(--chart-4)" },
  { value: "discharged", label: "Discharged", tone: "neutral", color: "var(--chart-2)" },
];

export const CONDITION_BY_VALUE = Object.fromEntries(CONDITIONS.map((c) => [c.value, c])) as Record<
  PatientCondition,
  (typeof CONDITIONS)[number]
>;

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

/** Suggestions for the doctor form (free text is still allowed). */
export const SPECIALIZATION_SUGGESTIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Medicine",
  "Gynecology",
  "Nephrology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
];

export const DOCTOR_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
] as const;

export const PATIENT_SORT_OPTIONS = [
  { value: "admission_desc", label: "Latest admission" },
  { value: "admission_asc", label: "Earliest admission" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "age_asc", label: "Age: youngest first" },
  { value: "age_desc", label: "Age: oldest first" },
] as const;

export const DASHBOARD_RANGES: { value: DashboardRange; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "last 7 days" },
  { value: "30d", label: "30D", long: "last 30 days" },
  { value: "90d", label: "90D", long: "last 90 days" },
  { value: "12m", label: "12M", long: "last 12 months" },
];
