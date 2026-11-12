import { Badge } from "@/components/ui/badge";
import { CONDITION_BY_VALUE } from "@/lib/constants";
import type { PatientCondition } from "@/types/api";

export function ConditionBadge({ condition }: { condition: PatientCondition }) {
  const meta = CONDITION_BY_VALUE[condition];
  return (
    <Badge tone={meta?.tone ?? "neutral"} dot>
      {meta?.label ?? condition}
    </Badge>
  );
}
