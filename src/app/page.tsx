import { redirect } from "next/navigation";

// `proxy.ts` normally handles "/" before it gets here; this is the fallback.
export default function Home() {
  redirect("/dashboard");
}
