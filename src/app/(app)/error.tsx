"use client";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/feedback";

/** Catches unexpected render errors inside the app shell (sidebar stays usable). */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
  return (
    <Card>
      <ErrorState message={message} onRetry={() => retry()} />
    </Card>
  );
}
