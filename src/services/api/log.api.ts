/**
 * Log API — Django backend (faqApi).
 * Ported from AlgoHopperBot LogService.
 * NOTE: Angular uses POST for getLogs (not GET).
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface LogParams {
  tid: string;
  dt: string;
  dtype: "state" | "log";
  ltype: "short" | "detail" | "log";
}

export const logApi = {
  getLogs: (params: LogParams) =>
    apiRequest<{ state?: Record<string, unknown>; logs?: unknown[] }>({
      url: CONSTANTS.API.LOG.GET_LOGS,
      data: params,
      method: "post",
      client: faqApi,
    }),
};
