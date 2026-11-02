/**
 * Strategy API — Django backend (faqApi).
 * Ported from AlgoHopperBot StrategyService.
 *
 * NOTE: Angular deleteStrategy was double-broken (action-string mismatch in
 * component + delete() misuse in service where payload was treated as base_url).
 * Fixed: use deleteQueryParams with _id.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";
import { StrategyTypeDefinition, AddStrategyTypeDTO, UpdateStrategyTypeDTO } from "@/types/strategy-type";

export interface StrategyEntity {
  _id: string;
  name: string;
  display_name: string;
  type: string;
  config: {
    capital: { buy: string; sell: string };
  };
  script: string;
  script_details: Record<string, unknown>;
  state: string;             // "active" | "inactive"
  scope: string;             // "public" | "private"
}

export const strategyApi = {
  listStrategies: (params?: { index?: number; limit?: number }) =>
    apiRequest<{ strategies: StrategyEntity[]; total_count: number }>({
      url: CONSTANTS.API.STRATEGY.GET_STRATEGIES,
      params: params as Record<string, unknown>,
      client: faqApi,
    }),

  addStrategy: (data: {
    name: string;
    display_name: string;
    type: string;
    config: { capital: { buy: string; sell: string } };
    script: string;
    script_details: Record<string, unknown>;
  }) =>
    apiRequest({ url: CONSTANTS.API.STRATEGY.ADD_STRATEGY, data, method: "post", client: faqApi }),

  updateStrategy: (data: {
    strategy_id: string;
    name: string;
    display_name: string;
    type: string;
    config: { capital: { buy: string; sell: string } };
    script: string;
    script_details: Record<string, unknown>;
  }) =>
    apiRequest({ url: CONSTANTS.API.STRATEGY.UPDATE_STRATEGY, data, method: "put", client: faqApi }),

  updateStrategyState: (id: string, state: string) =>
    apiRequest({
      url: CONSTANTS.API.STRATEGY.UPDATE_STRATEGY_STATE,
      data: { _id: id, state },
      method: "put",
      client: faqApi,
    }),

  updateStrategyScope: (id: string, scope: string) =>
    apiRequest({
      url: CONSTANTS.API.STRATEGY.UPDATE_STRATEGY_SCOPE,
      data: { _id: id, scope },
      method: "put",
      client: faqApi,
    }),

  /** Fixed: Angular used delete(url, data) which treated data as base_url.
   *  Now sends DELETE with _id as query param. */
  deleteStrategy: (id: string) =>
    faqApi.delete(`${CONSTANTS.API.STRATEGY.DELETE_STRATEGY}`, { params: { _id: id } })
      .then((res) => res.data),
};
