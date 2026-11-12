import { AppShell } from "@/components/layout/app-shell";

/** Every route in the (app) group requires a session — enforced in `src/proxy.ts`. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
