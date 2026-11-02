/**
 * JsonViewer — recursive JSON tree viewer.
 * Replaces Angular ngx-json-viewer. Used in Logs detailed view.
 */

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeProps {
  label: string | null;
  value: unknown;
  depth?: number;
  defaultExpanded?: boolean;
}

function JsonNode({ label, value, depth = 0, defaultExpanded = true }: NodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);
  const isObject = value !== null && typeof value === "object";
  const isArray  = Array.isArray(value);
  const entries  = isObject ? Object.entries(value as Record<string, unknown>) : [];
  const indent   = depth * 16;

  const typeColor = () => {
    if (value === null)       return "text-muted-foreground";
    if (typeof value === "boolean") return value ? "text-success" : "text-destructive";
    if (typeof value === "number")  return "text-primary";
    if (typeof value === "string")  return "text-warning";
    return "text-foreground";
  };

  const primitive = () => {
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    return String(value);
  };

  return (
    <div style={{ marginLeft: indent }}>
      {isObject ? (
        <div>
          <button
            className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {label !== null && (
              <span className="text-foreground font-medium mr-1">{label}:</span>
            )}
            <span className="text-muted-foreground">
              {isArray ? `[${entries.length}]` : `{${entries.length}}`}
            </span>
          </button>
          {expanded && (
            <div>
              {entries.map(([k, v]) => (
                <JsonNode
                  key={k}
                  label={isArray ? k : k}
                  value={v}
                  depth={depth + 1}
                  defaultExpanded={false}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-sm py-0.5">
          {label !== null && (
            <span className="text-foreground font-medium">{label}:</span>
          )}
          <span className={cn(typeColor())}>{primitive()}</span>
        </div>
      )}
    </div>
  );
}

interface Props {
  data: unknown;
  /** Expand all nodes by default up to this depth */
  expandDepth?: number;
  className?: string;
}

export function JsonViewer({ data, className }: Props) {
  return (
    <div
      className={cn(
        "font-mono text-xs bg-muted/40 rounded-md p-4 overflow-auto max-h-96 border",
        className
      )}
    >
      <JsonNode label={null} value={data} depth={0} defaultExpanded />
    </div>
  );
}
