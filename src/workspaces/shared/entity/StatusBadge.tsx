import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "running"
  | "stopped"
  | "active"
  | "inactive"
  | "enabled"
  | "disabled"
  | "success"
  | "error"
  | "warning"
  | "pending";

const VARIANT_MAP: Record<
  StatusVariant,
  { label: string; className: string }
> = {
  running:  { label: "Running",  className: "bg-success/15 text-success border-success/30" },
  active:   { label: "Active",   className: "bg-success/15 text-success border-success/30" },
  enabled:  { label: "Enabled",  className: "bg-success/15 text-success border-success/30" },
  success:  { label: "Success",  className: "bg-success/15 text-success border-success/30" },
  stopped:  { label: "Stopped",  className: "bg-destructive/15 text-destructive border-destructive/30" },
  error:    { label: "Error",    className: "bg-destructive/15 text-destructive border-destructive/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  disabled: { label: "Disabled", className: "bg-muted text-muted-foreground" },
  warning:  { label: "Warning",  className: "bg-warning/15 text-warning border-warning/30" },
  pending:  { label: "Pending",  className: "bg-warning/15 text-warning border-warning/30" },
};

interface Props {
  status: StatusVariant | string;
  /** Override the displayed label */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: Props) {
  const config = VARIANT_MAP[status as StatusVariant];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        config?.className ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label ?? config?.label ?? status}
    </Badge>
  );
}
