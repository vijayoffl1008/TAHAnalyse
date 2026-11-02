/**
 * Client API — Django backend (faqApi).
 * Ported from AlgoHopperBot ClientService.
 *
 * Gap-2: All CLIENT endpoints currently point to "test/" stubs in constants.
 * Replicate as-is per migration plan.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface StrategyLeg {
  strike: number;
  option_type: string;
  position: "buy" | "sell";
  quantity: number;
  entry: number;
  exit?: number;
}

export interface ClientStrategy {
  name: string;
  legs: string[];
  pnl?: number;
  [key: string]: unknown;
}

export interface ClientReport {
  date: string;
  pnl: number;
}

export const clientApi = {
  getStrategies: (type: string = "all") =>
    apiRequest<{ completed: ClientStrategy[]; running: ClientStrategy[] }>({
      url: CONSTANTS.API.CLIENT.GET_STRATEGIES,
      params: { type },
      client: faqApi,
    }),

  closeLeg: () =>
    apiRequest({ url: CONSTANTS.API.CLIENT.CLOSE_LEG, params: {}, client: faqApi }),

  getReport: (type: string = "all") =>
    apiRequest<{ reports: ClientReport[]; report_pnl: number }>({
      url: CONSTANTS.API.CLIENT.GET_REPORTS,
      params: { type },
      client: faqApi,
    }),
};
