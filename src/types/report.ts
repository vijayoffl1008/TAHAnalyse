// ── Report (report/* — REPORT_BASE_URL) ──────────────────────────────────────

export type ReportPeriod = "daily" | "monthly";
export type ReportInputType = "order_matching" | "state_file" | "manual";
export type ReportStatus = "active" | "inactive";

export interface ReportStrategy {
  user_id: string;
  thread_id: string;
  entry_type?: "buy" | "sell";
}

export interface Report {
  report_id: string;
  name: string;
  /** period type: 'daily' | 'monthly' */
  type: ReportPeriod;
  status: ReportStatus;
  strategies: ReportStrategy[];
}

export interface AddReportDTO {
  name: string;
  type: ReportPeriod;
  strategies: ReportStrategy[];
}

export interface UpdateReportDTO extends AddReportDTO {
  report_id: string;
}

export interface ReportDataEntry {
  date: string;
  pnl: number;
  trades: number;
}

export interface GenerateReportDTO {
  report_id: string;
  date: string;
  force?: boolean;
}

export interface DownloadReportDTO {
  report_id: string;
  date: string;
}
