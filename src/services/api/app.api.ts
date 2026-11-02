/**
 * App API — Django CONT_BASE_URL (contApi).
 * Ported from AlgoHopperBot AppService.
 * getAppState and initApp go to the contract/cont backend.
 */

import { contApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface AppStateResponse {
  cache_init: number;          // 1 = loaded, 0 = not loaded
  feed_user_status: number;    // 1 = connected, 0 = not connected
}

export const appApi = {
  getAppState: () =>
    apiRequest<AppStateResponse>({
      url: CONSTANTS.API.APP.APP_STATE,
      client: contApi,
    }),

  initApp: (force: number = 1) =>
    apiRequest({
      url: CONSTANTS.API.APP.INIT_APP,
      params: { force },
      client: contApi,
    }),
};
