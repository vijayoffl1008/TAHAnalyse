/**
 * Broker API — Django backend.
 * Ported from AlgoHopperBot BrokerService.
 * Most methods use faqApi (BASE_URL); contractAccountLogin uses contApi (CONT_BASE_URL).
 */

import { faqApi, contApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";
import { BrokerAccount, AddBrokerDTO, UpdateBrokerDTO, ConnectBrokerDTO } from "@/types/broker";

export const brokerApi = {
  getUserBrokers: (params: { acc_id?: string; dt?: string }) =>
    apiRequest<{ broker_accounts: BrokerAccount[] }>({
      url: CONSTANTS.API.BROKER.USER_BROKERS,
      params,
      client: faqApi,
    }),

  getAllBrokers: (params: { bname?: string }) =>
    apiRequest<{ broker_accounts: BrokerAccount[] }>({
      url: CONSTANTS.API.BROKER.ALL_BROKERS,
      params,
      client: faqApi,
    }),

  addBroker: (data: AddBrokerDTO) =>
    apiRequest({ url: CONSTANTS.API.BROKER.ADD_BROKER, data, method: "post", client: faqApi }),

  updateBroker: (data: UpdateBrokerDTO) =>
    apiRequest({ url: CONSTANTS.API.BROKER.UPDATE_BROKER, data, method: "put", client: faqApi }),

  deleteBroker: (id: string) =>
    apiRequest({ url: CONSTANTS.API.BROKER.DELETE_BROKER, params: { _id: id }, client: faqApi }),

  connectBroker: (data: ConnectBrokerDTO) =>
    apiRequest({ url: CONSTANTS.API.BROKER.CONNECT_BROKER, params: { _id: data._id, bname: data.bname }, client: faqApi }),

  getProfile: (params: { acc_id?: string }) =>
    apiRequest({ url: CONSTANTS.API.USERS.GET_PROFILE, params, client: faqApi }),

  /** Uses contApi (CONT_BASE_URL) — Zerodha OAuth login URL */
  contractAccountLogin: (bname: string = "zerodha") =>
    apiRequest<{ url: string }>({
      url: CONSTANTS.API.BROKER.FEED_ACCOUNT_LOGIN,
      params: { bname },
      client: contApi,
    }),
};
