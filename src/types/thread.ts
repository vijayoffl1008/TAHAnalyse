// ── Strategy Thread (thread/*) ────────────────────────────────────────────────

export type ThreadState = "running" | "stopped";

export interface Thread {
  _id: string;
  /** Display name (editable inline) */
  display_name: string;
  strategy_name: string;
  strategy_display_name: string;
  broker_account: string;
  state: ThreadState;
  enabled: boolean;
  acc_id: string;
  user_id: string;
}

export interface ThreadListParams {
  count_per_page: number;
  page_num: number;
  acc_id: string;
  display_for: "web_main_list" | string;
}

export interface AddThreadDTO {
  acc_id: string;
  strategy_name: string;
  ba_id: string;
  settings: Record<string, unknown>;
  display_name?: string;
}

export interface UpdateThreadDTO {
  tid: string;
  settings: Record<string, unknown>;
}

export interface ThreadActionDTO {
  tid: string;
  action: "enable" | "disable";
}

export interface UpdateDNameDTO {
  tid: string;
  display_name: string;
}
