"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
  { label: "Administrator", hint: "Can add, edit and delete", email: "admin@doctortracker.dev", password: "Admin@12345" },
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
      },
    });
  });

  const serverError =
    login.error instanceof ApiError ? login.error.message : login.error ? "Unable to sign in. Please try again." : null;

  return (
    <div className="w-full max-w-[22rem]">
      <h1 className="font-display text-[40px] leading-none font-bold">Sign in</h1>
      <p className="mt-3 text-[15px] text-muted-foreground">Use your hospital admin account.</p>

      {sessionExpired && !serverError && (
        <p className="mt-6 border-l-4 border-warning bg-warning-soft px-3 py-2.5 text-sm">
          Your session expired. Sign in again to continue where you left off.
        </p>
      )}
      {serverError && (
        <p role="alert" className="mt-6 border-l-4 border-destructive bg-destructive-soft px-3 py-2.5 text-sm font-semibold text-destructive">
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
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-[4px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" loading={login.isPending} className="mt-2 w-full">
          Sign in
        </Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-10 border-t pt-5">
          <p className="text-sm text-muted-foreground">Exploring the demo? Fill in a sample account:</p>
          <ul className="mt-3 divide-y border-y">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setValue("email", account.email, { shouldValidate: true });
                    setValue("password", account.password, { shouldValidate: true });
                  }}
                  className="flex w-full items-baseline justify-between gap-4 py-2.5 text-left hover:text-primary"
                >
                  <span className="font-bold">{account.label}</span>
                  <span className="text-[13px] text-muted-foreground">{account.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
