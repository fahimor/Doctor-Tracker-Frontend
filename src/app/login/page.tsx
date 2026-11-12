import { Activity, BarChart3, ShieldCheck, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/feedback";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

const highlights = [
  { icon: Stethoscope, title: "Doctors & patients", text: "One place for every doctor and the patients under their care." },
  { icon: BarChart3, title: "Live analytics", text: "Admissions, conditions and workload trends at a glance." },
  { icon: ShieldCheck, title: "Secure by default", text: "httpOnly sessions, role-based access and audited APIs." },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[oklch(0.42_0.08_195)] p-12 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60rem 40rem at 110% -10%, oklch(0.62 0.12 186 / 0.75), transparent 60%), radial-gradient(40rem 30rem at -10% 110%, oklch(0.38 0.12 265 / 0.7), transparent 60%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden
        />
        <div className="relative">
          <Logo inverted />
        </div>
        <div className="relative mt-auto max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
            <Activity className="size-3.5" /> Built for clinical operations teams
          </p>
          <h2 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight">
            Know every doctor&apos;s caseload, before it becomes a problem.
          </h2>
          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-xs text-white/60">Doctor Tracker · Admin portal</p>
      </section>

      {/* Form panel */}
      <section className="flex flex-col px-5 py-10 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-6 h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
