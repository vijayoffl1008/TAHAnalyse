/**
 * Config API — Django backend (faqApi).
 * Ported from AlgoHopperBot ConfigService.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface ConfigCds {
  enc_token?: string;
  zrdha_feed_id?: string;
  preferred_broker?: string;
  [key: string]: string | undefined;
}

export interface UpdateCdsItem {
  key: string;
  value: string;
}

export const configApi = {
  getAuthConfigs: (keys: string) =>
    apiRequest<{ cds: ConfigCds }>({
      url: CONSTANTS.API.CONFIG_DATA.GET_AUTH_CDS,
      params: { keys },
      client: faqApi,
    }),

  getConfigData: (keys: string) =>
    apiRequest<{ cds: ConfigCds }>({
      url: CONSTANTS.API.CONFIG_DATA.GET_CDS,
      params: { keys },
      client: faqApi,
    }),

  updateCDatas: (cds: UpdateCdsItem[]) =>
    apiRequest({ url: CONSTANTS.API.CONFIG_DATA.UPDATE_CDS, data: { cds }, method: "post", client: faqApi }),
};
