import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/feedback";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* The wordmark, set large, is the whole visual. */}
      <section className="relative hidden overflow-hidden bg-rail text-rail-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <p className="max-w-xs text-[15px] leading-relaxed text-rail-muted">
          Doctors, their patients and every admission across your hospitals, kept in one place.
        </p>
        <h2 className="font-display text-[clamp(5rem,9vw,8.5rem)] leading-[0.82] font-extrabold tracking-[-0.02em]">
          Doctor
          <br />
          Tracker
          <span className="mt-6 block h-3 w-24 rounded-[2px] bg-[#3fb489]" aria-hidden />
        </h2>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-12">
        <div className="text-2xl text-foreground lg:hidden">
          <Logo inline />
        </div>
        <div className="flex flex-1 items-center py-10 lg:pl-8">
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
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-6 h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
