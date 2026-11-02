// ── Logs (tl/list/) ───────────────────────────────────────────────────────────

export type LogType = "state" | "log";
export type LogDisplayType = "detailed" | "short";

export interface LogEntry {
  _id: string;
  tid: string;
  dt: string;
  dtype: LogDisplayType;
  ltype: LogType;
  data: unknown;
}

export interface LogListParams {
  tid: string;
  dt: string;
  dtype: LogDisplayType;
  ltype: LogType;
  page_num?: number;
  count_per_page?: number;
}
