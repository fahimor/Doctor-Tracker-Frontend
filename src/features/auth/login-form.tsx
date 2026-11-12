"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { useLogin } from "./api";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { label: "Admin", hint: "Full access", email: "admin@doctortracker.dev", password: "Admin@12345" },
  { label: "Viewer", hint: "Read-only", email: "viewer@doctortracker.dev", password: "Viewer@12345" },
];
const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "false";

/** Only allow same-site relative redirects (prevents open-redirect attacks). */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const sessionExpired = searchParams.get("expired") === "1";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(safeNext(searchParams.get("next")));
        router.refresh();
      },
    });
  });

  const serverError =
    login.error instanceof ApiError ? login.error.message : login.error ? "Unable to sign in. Please try again." : null;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage doctors, patients and analytics.</p>

      {sessionExpired && !serverError && (
        <p className="mt-6 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm">
          Your session has expired. Please sign in again.
        </p>
      )}
      {serverError && (
        <p role="alert" className="mt-6 rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
          {serverError}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@hospital.com" autoFocus {...fieldAria("email", errors.email?.message)} {...register("email")} />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              {...fieldAria("password", errors.password?.message)}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" loading={login.isPending} className="mt-2 w-full">
          {!login.isPending && <LogIn />}
          Sign in
        </Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-8 rounded-xl border border-dashed bg-muted/40 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <ShieldCheck className="size-3.5" /> Demo accounts
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setValue("email", account.email, { shouldValidate: true });
                  setValue("password", account.password, { shouldValidate: true });
                }}
                className="rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="block text-sm font-semibold">{account.label}</span>
                <span className="block text-xs text-muted-foreground">{account.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
