/**
 * Tradeboard API — Django ORDER_BASE_URL (orderApi).
 * Ported from AlgoHopperBot TradeboardService.
 */

import { orderApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface Tradeboard {
  name: string;
  params: Record<string, unknown>;
  users: Record<string, unknown>[];
  contracts: Record<string, unknown>[];
  tgt: Record<string, unknown>;
  sl: Record<string, unknown>;
  tsl: Record<string, unknown>;
  edit_mode?: boolean;
}

export const tradeboardApi = {
  getAllTradeboards: () =>
    apiRequest<{ tradeboards: Tradeboard[] }>({
      url: CONSTANTS.API.TRADEBOARD.GET,
      client: orderApi,
    }),

  addTradeboard: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.TRADEBOARD.ADD, data, method: "post", client: orderApi }),

  updateTradeboard: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.TRADEBOARD.UPDATE, data, method: "put", client: orderApi }),

  deleteTradeboard: (name: string) =>
    orderApi
      .delete(CONSTANTS.API.TRADEBOARD.DELETE, { params: { name } })
      .then((res) => res.data),

  getTradeboardDetails: (name: string) =>
    apiRequest<{ tradeboard: Tradeboard }>({
      url: `${CONSTANTS.API.TRADEBOARD.GET_DETAILS}/${name}`,
      client: orderApi,
    }),
};
