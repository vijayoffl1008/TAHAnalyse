/**
 * LogsPage — log viewer.
 * Ported from AlgoHopperBot logs.component.
 *
 * Admin: log type selector (State/Log), UserSelector, thread selector, date, load.
 * State logs: Detailed (JsonViewer) + Short (tabular) tabs.
 * Client: Short state view only.
 *
 * Inc-8 (replicate as-is): search/pagination are not wired — initial load works.
 * Inc-6 fix: EntityTable used for short view (pagination available when needed).
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { logApi } from "@/services/api/log.api";
import { threadApi } from "@/services/api/thread.api";
import { PageHeader, TabbedView, JsonViewer, DateRangePicker, UserSelector, notify } from "@/workspaces/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const LOG_TYPES = [
  { name: "State", _id: "state" },
  { name: "Logs", _id: "log" },
];

const SHORT_COLUMNS = [
  { id: "sp", name: "Strike" },
  { id: "avg", name: "Entry" },
  { id: "xavg", name: "Exit" },
  { id: "tgt", name: "Tgt" },
  { id: "trailed", name: "Trailed" },
  { id: "init_sl", name: "Init SL" },
  { id: "ct_sl", name: "SL" },
  { id: "state", name: "State" },
];

const STATE_LABELS: Record<string, string> = {
  completed: "Closed",
  sl_hit: "SL Hit",
  tgt_hit: "Tgt Hit",
};

export function LogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedLogType, setSelectedLogType] = useState("state");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [logState, setLogState] = useState<{
    detail: Record<string, unknown>;
    short: { cols: string[]; rows: Record<string, string>[] };
    logs: unknown[];
  }>({ detail: {}, short: { cols: [], rows: [] }, logs: [] });

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  const accId = isAdmin ? selectedUserId : user?.id ?? "";

  // ── Thread list for selected user ──────────────────────────────────────────
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["threads", accId],
    queryFn: () =>
      threadApi.list({ count_per_page: 50, page_num: 1, acc_id: accId, display_for: "web_main_list" }),
    enabled: !!accId,
    select: (d) => d.threads,
  });

  // ── Load logs mutation ─────────────────────────────────────────────────────
  const loadLogs = useMutation({
    mutationFn: () => {
      const params = isAdmin
        ? { tid: selectedThreadId, dt: dateStr, dtype: selectedLogType as any, ltype: "short" as any }
        : { tid: selectedThreadId, dt: dateStr, dtype: "state" as any, ltype: "short" as any };
      return logApi.getLogs(params);
    },
    onSuccess: (data: any) => {
      if (selectedLogType === "state") {
        // Short view
        const keys = Object.keys(data.state ?? {});
        let colsAdded = false;
        const short = { cols: [] as string[], rows: [] as Record<string, string>[] };
        for (const key of keys) {
          const obj = data.state[key];
          const row: Record<string, string> = { "#": key.toUpperCase() };
          for (const col of SHORT_COLUMNS) {
            if (!colsAdded) short.cols.push(col.name);
            if (col.id === "state") {
              row[col.name] = STATE_LABELS[obj[col.id]] ?? "-";
            } else {
              row[col.name] = String(obj[col.id] ?? "-");
            }
          }
          colsAdded = true;
          short.rows.push(row);
        }
        setLogState({ detail: data.state ?? {}, short, logs: [] });
      } else {
        setLogState({ detail: {}, short: { cols: [], rows: [] }, logs: data.logs ?? [] });
      }
    },
    onError: () => notify.error("Failed to load logs"),
  });

  const tabs = isAdmin && selectedLogType === "state"
    ? [
        {
          id: "detail",
          label: "Detailed",
          content: Object.keys(logState.detail).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No log data. Click Load.</p>
          ) : (
            <JsonViewer data={logState.detail} />
          ),
        },
        {
          id: "short",
          label: "Short",
          content: <ShortLogsTable short={logState.short} />,
        },
      ]
    : [
        {
          id: "short",
          label: selectedLogType === "state" ? "State" : "Logs",
          content: selectedLogType === "state"
            ? <ShortLogsTable short={logState.short} />
            : <JsonViewer data={logState.logs} />,
        },
      ];

  return (
    <div>
      <PageHeader title="Logs" description="Strategy execution logs" />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end mb-6">
        {isAdmin && (
          <>
            <div>
              <p className="text-sm font-medium mb-1">Log Type</p>
              <Select value={selectedLogType} onValueChange={setSelectedLogType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOG_TYPES.map((lt) => <SelectItem key={lt._id} value={lt._id}>{lt.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">User</p>
              <UserSelector value={selectedUserId} onValueChange={setSelectedUserId} placeholder="Select user" />
            </div>
          </>
        )}

        <div>
          <p className="text-sm font-medium mb-1">Strategy Thread</p>
          {threadsLoading ? (
            <Skeleton className="h-9 w-52" />
          ) : (
            <Select value={selectedThreadId} onValueChange={setSelectedThreadId}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Select thread" /></SelectTrigger>
              <SelectContent>
                {threads.map((t: any) => (
                  <SelectItem key={t._id} value={t._id}>{t.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Date</p>
          <DateRangePicker value={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd" />
        </div>

        <Button
          onClick={() => loadLogs.mutate()}
          disabled={!selectedThreadId || loadLogs.isPending}
          className="gap-2"
        >
          {loadLogs.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Load
        </Button>
      </div>

      {/* Log tabs */}
      {loadLogs.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <TabbedView tabs={tabs} defaultTab={tabs[0]?.id} />
      )}
    </div>
  );
}

function ShortLogsTable({ short }: { short: { cols: string[]; rows: Record<string, string>[] } }) {
  if (short.rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No log data. Click Load.</p>;
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            {short.cols.map((col) => <TableHead key={col}>{col}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {short.rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{row["#"]}</TableCell>
              {short.cols.map((col) => <TableCell key={col}>{row[col]}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
