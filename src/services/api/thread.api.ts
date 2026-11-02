/**
 * Thread API — Django backend (faqApi).
 * Ported from AlgoHopperBot ThreadService.
 *
 * NOTE: start/stop/delete are GETs with query params (not RESTful POST/DELETE).
 * Preserving existing backend contract.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface ThreadRaw {
  _id: string;
  display_name: string;
  state: "running" | "stopped";
  status: "enabled" | "disabled";
  settings: Record<string, unknown>;
  ba: { name: string; client_id: string };
  acc_id: string;
  user_id: string;
}

export interface ThreadListParams {
  count_per_page: number;
  page_num: number;
  acc_id: string;
  display_for: string;
}

export const threadApi = {
  list: (params: ThreadListParams) =>
    apiRequest<{ threads: ThreadRaw[]; count: number }>({
      url: CONSTANTS.API.THREAD.GET_THREADS,
      params,
      client: faqApi,
    }),

  add: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.THREAD.ADD_THREAD, data, method: "post", client: faqApi }),

  start: (tid: string) =>
    apiRequest({ url: CONSTANTS.API.THREAD.START_THREAD, params: { tid }, client: faqApi }),

  stop: (tid: string) =>
    apiRequest({ url: CONSTANTS.API.THREAD.STOP_THREAD, params: { tid }, client: faqApi }),

  update: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.THREAD.UPDATE_THREAD, data, method: "post", client: faqApi }),

  deleteThread: (tid: string) =>
    apiRequest({ url: CONSTANTS.API.THREAD.DELETE_THREAD, params: { tid }, client: faqApi }),

  action: (tid: string, action: "enable" | "disable") =>
    apiRequest({
      url: CONSTANTS.API.THREAD.THREAD_ACTION,
      data: { tid, action },
      method: "post",
      client: faqApi,
    }),

  updateDName: (tid: string, displayName: string) =>
    apiRequest({
      url: CONSTANTS.API.THREAD.THREAD_UPDATE_DNAME,
      data: { tid, display_name: displayName },
      method: "post",
      client: faqApi,
    }),
};
