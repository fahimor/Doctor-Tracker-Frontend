import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 sm:px-16">
      <p className="font-display text-[7rem] leading-none font-extrabold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">Check the address, or head back to the dashboard.</p>
      <Link href="/dashboard" className={buttonClasses({ className: "mt-6 self-start" })}>
        Back to dashboard
      </Link>
    </main>
  );
}
