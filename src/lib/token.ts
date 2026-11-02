const KEYS = {
  ACCESS_TOKEN: "access_token",
  SOCKET_CONN: "socket_conn",
  USER: "tahanalyzer_user",
} as const;

// ── Django token (used by faqApi and all Django microservice clients) ────────

export const getAccessToken = (): string | null =>
  localStorage.getItem(KEYS.ACCESS_TOKEN);

export const setAccessToken = (token: string): void =>
  localStorage.setItem(KEYS.ACCESS_TOKEN, token);

// ── Socket connection details (saved from Django login response) ─────────────

export interface SocketConn {
  socket_url: string;
  bname: string;
  instruments: string[];
}

export const getSocketConn = (): SocketConn | null => {
  const raw = localStorage.getItem(KEYS.SOCKET_CONN);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SocketConn;
  } catch {
    return null;
  }
};

export const setSocketConn = (conn: SocketConn): void =>
  localStorage.setItem(KEYS.SOCKET_CONN, JSON.stringify(conn));

// ── Clear all auth state ─────────────────────────────────────────────────────

export const clearAuth = (): void => {
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.SOCKET_CONN);
  localStorage.removeItem(KEYS.USER);
};
