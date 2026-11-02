/**
 * Symbol API — Django backend (faqApi).
 * Ported from AlgoHopperBot SymbolService.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export const symbolApi = {
  getCategories: () =>
    apiRequest<{ categories: string[] }>({ url: CONSTANTS.API.SYMBOLS.GET_CATEGORIES, client: faqApi }),

  getSegments: () =>
    apiRequest<{ segments: string[] }>({ url: CONSTANTS.API.SYMBOLS.GET_SEGMENTS, client: faqApi }),

  getSymbols: (params: Record<string, string>) =>
    apiRequest({ url: CONSTANTS.API.SYMBOLS.GET_SYMBOLS, params, client: faqApi }),

  getExchanges: (params: Record<string, string> = {}) =>
    apiRequest<{ exchanges: string[] }>({ url: CONSTANTS.API.SYMBOLS.GET_EXCHANGES, params, client: faqApi }),
};
