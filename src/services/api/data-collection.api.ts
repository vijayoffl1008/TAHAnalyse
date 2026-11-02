/**
 * Data Collection API — Django backend (faqApi).
 * Ported from AlgoHopperBot DataCollectionService.
 * All methods are GETs with query params.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export const dataCollectionApi = {
  getCategories: () =>
    apiRequest<{ categories: { index: string; display_name: string }[] }>({
      url: CONSTANTS.API.DATA_COLLECTION.LIST_CATEGORIES,
      params: {},
      client: faqApi,
    }),

  runData: (dt: string, index: string) =>
    apiRequest({ url: CONSTANTS.API.DATA_COLLECTION.RUN_DATA, params: { dt, index }, client: faqApi }),

  stopData: () =>
    apiRequest({ url: CONSTANTS.API.DATA_COLLECTION.STOP_DATA, params: {}, client: faqApi }),

  checkDataRunStatus: () =>
    apiRequest<{ status: string }>({ url: CONSTANTS.API.DATA_COLLECTION.CHECK_DATA_RUN_STATUS, params: {}, client: faqApi }),

  checkDataStatus: (dt: string, index: string) =>
    apiRequest<{ result: { data: Record<string, { "1m": string; "1d": string }> } }>({
      url: CONSTANTS.API.DATA_COLLECTION.CHECK_DATA_STATUS,
      params: { dt, index },
      client: faqApi,
    }),

  splitCategories: (dt: string) =>
    apiRequest<{ result: { status: string } }>({
      url: CONSTANTS.API.DATA_COLLECTION.SPLIT_CATEGORY,
      params: { dt },
      client: faqApi,
    }),

  archieveData: (dt: string) =>
    apiRequest({ url: CONSTANTS.API.DATA_COLLECTION.ARCHIEVE_DATA, params: { dt }, client: faqApi }),

  stopArchieveData: () =>
    apiRequest({ url: CONSTANTS.API.DATA_COLLECTION.STOP_ARCHIEVE_DATA, params: {}, client: faqApi }),

  archieveDataRunStatus: () =>
    apiRequest<{ status: string }>({ url: CONSTANTS.API.DATA_COLLECTION.ARCHIEVE_DATA_RUN_STATUS, params: {}, client: faqApi }),
};
