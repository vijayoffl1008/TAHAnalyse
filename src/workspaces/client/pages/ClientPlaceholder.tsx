import { Construction } from "lucide-react";

interface Props { title: string }

export function ClientPlaceholder({ title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <Construction className="h-12 w-12" />
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm">This page is being migrated. Coming in Phase 2+.</p>
    </div>
  );
}
