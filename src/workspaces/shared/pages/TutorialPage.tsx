/**
 * TutorialPage — placeholder.
 * DC-Keep-1: Tutorial content will be implemented in a future phase.
 */

import { BookOpen } from "lucide-react";

export function TutorialPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <BookOpen className="h-16 w-16" />
      <h2 className="text-2xl font-semibold text-foreground">Tutorial</h2>
      <p className="text-sm max-w-sm text-center">
        Tutorial content is coming soon. Check back later for guides on using TheAlgoHopper Bot.
      </p>
    </div>
  );
}
