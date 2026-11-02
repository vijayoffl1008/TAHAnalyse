/**
 * Auth API — calls Django backend (faqApi).
 *
 * Django login response shape (confirmed from quant_services/impl/auth.py):
 * {
 *   response_code: 1000,
 *   token: string,
 *   admin: boolean,
 *   user: { _id: string, full_name: string, email: string, phone: string },
 *   socket_conn: { socket_url: string, bname: string, instruments: string[] }
 * }
 */

import { faqApi } from "../clients";
import { apiRequest } from "../helper";
import { SocketConn } from "../../../lib/token";
import { CONSTANTS } from "../../../lib/constants";

// ── Request / Response types ──────────────────────────────────────────────────

export interface LoginRequest {
  /** Email or phone number */
  username: string;
  password: string;
}

export interface DjangoUser {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface LoginResponse {
  response_code: number;
  token: string;
  /** true = admin, false = regular user */
  admin: boolean;
  user: DjangoUser;
  socket_conn: SocketConn;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const loginAPI = (payload: LoginRequest) =>
  apiRequest<LoginResponse, LoginRequest>({
    method: "post",
    url: CONSTANTS.API.LOGIN,
    data: payload,
    client: faqApi,
  });

export const logoutAPI = () =>
  apiRequest<void>({
    method: "get",
    url: CONSTANTS.API.LOGOUT,
    client: faqApi,
  });

export const getProfileAPI = () =>
  apiRequest<{ user: DjangoUser }>({
    method: "get",
    url: CONSTANTS.API.USERS.GET_PROFILE,
    client: faqApi,
  });
