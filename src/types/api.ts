/* Shapes returned by the Doctor Tracker REST API. */

export type Role = "admin" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type PatientCondition = "stable" | "critical" | "recovering" | "under_observation" | "discharged";
export type Gender = "male" | "female" | "other";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListItem extends Doctor {
  patientCount: number;
}

export interface DoctorDetail extends Doctor {
  stats: {
    totalPatients: number;
    byCondition: Partial<Record<PatientCondition, number>>;
    lastAdmission: string | null;
  };
}

export type DoctorSummary = Pick<Doctor, "_id" | "name" | "specialization" | "hospital">;

export interface DoctorFacets {
  specializations: string[];
  hospitals: string[];
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  diagnosis: string;
  condition: PatientCondition;
  admissionDate: string;
  notes?: string;
  doctor: DoctorSummary | null;
  createdAt: string;
  updatedAt: string;
}

export type DashboardRange = "7d" | "30d" | "90d" | "12m";

export interface DashboardStats {
  range: DashboardRange;
  period: { from: string; to: string; unit: "day" | "week" | "month" };
  totals: {
    doctors: number;
    patients: number;
    criticalPatients: number;
    avgPatientsPerDoctor: number;
    newPatients: number;
    newPatientsChange: number | null;
    newDoctors: number;
  };
  admissionsTrend: { date: string; total: number; critical: number }[];
  patientsByCondition: { condition: PatientCondition; count: number }[];
  patientsByGender: { gender: Gender; count: number }[];
  patientsByAge: { bucket: string; count: number }[];
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; count: number }[];
  doctorsBySpecialization: { specialization: string; count: number }[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}
