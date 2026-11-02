/**
 * Account API — Django backend (faqApi).
 * Ported from AlgoHopperBot AccountService.
 *
 * NOTE: Angular uses POST for both add and update (not PUT).
 * DELETE and ACTIVATE are GETs with query params (not DELETE/PUT HTTP methods).
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Account {
  _id: string;
  state: string;               // "active" | "inactive"
  subscription_upto: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface AddAccountDTO {
  user: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
  };
  subscription_upto: string;
}

export interface UpdateAccountDTO {
  account_id: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
    password: string;          // empty string on edit
  };
  subscription_upto: string;
}

export interface ChangePasswordDTO {
  old_password: string;
  new_password: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const accountApi = {
  listAccounts: (params?: { page?: number; page_size?: number }) =>
    apiRequest<{ accounts: Account[]; total_count: number }>({
      url: CONSTANTS.API.USERS.GET_USERS,
      params: params as Record<string, unknown>,
      client: faqApi,
    }),

  addAccount: (data: AddAccountDTO) =>
    apiRequest({ url: CONSTANTS.API.USERS.ADD_USER, data, method: "post", client: faqApi }),

  getAccountDetails: () =>
    apiRequest<{ account: Account }>({
      url: CONSTANTS.API.USERS.GET_ACCOUNT,
      client: faqApi,
    }),

  updateAccount: (data: UpdateAccountDTO) =>
    apiRequest({ url: CONSTANTS.API.USERS.UPDATE_USER, data, method: "post", client: faqApi }),

  /** Angular uses GET with query params (not DELETE method) */
  deleteAccount: (id: string) =>
    apiRequest({ url: CONSTANTS.API.USERS.DELETE_USER, params: { _id: id }, client: faqApi }),

  /** Angular uses GET with query params {_id, state} */
  activateAccount: (id: string, state: number) =>
    apiRequest({
      url: CONSTANTS.API.USERS.ACTIVATE_USER,
      params: { _id: id, state },
      client: faqApi,
    }),

  changePassword: (data: ChangePasswordDTO) =>
    apiRequest({ url: CONSTANTS.API.USERS.CHANGE_PASSWORD, data, method: "post", client: faqApi }),
};
