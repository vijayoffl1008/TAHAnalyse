/**
 * SchedulerPage — stub.
 * Inc-7: entirely a stub (replicate as-is from Angular).
 * Not in any sidebar navigation.
 */

import { Construction } from "lucide-react";

export function SchedulerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <Construction className="h-12 w-12" />
      <h2 className="text-xl font-semibold text-foreground">Scheduler</h2>
      <p className="text-sm text-center">
        Scheduler is not yet implemented (Inc-7 — replicated as stub from Angular).
      </p>
    </div>
  );
}
