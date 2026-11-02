// ── Config Data (cdata/*) ─────────────────────────────────────────────────────

export interface ConfigData {
  key: string;
  value: string;
}

export interface GetConfigDTO {
  keys: string;
}

export interface UpdateConfigDTO {
  cds: ConfigData[];
}

// ── App State (app/*) ─────────────────────────────────────────────────────────

export interface AppState {
  contracts_loaded: boolean;
  feed_user_connected: boolean;
}
