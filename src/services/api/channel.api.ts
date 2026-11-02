/**
 * Channel API — Django backend.
 * Ported from AlgoHopperBot ChannelService.
 *
 * Key: getChannelList, startStopChannel, switchChannel, setServerFeedMode
 * use a DYNAMIC server URL (the selected server's api_url), not the default faqApi base.
 * getConnectionDetails and getServerList use faqApi (default base).
 */

import axios from "axios";
import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { getAccessToken } from "@/lib/token";
import { CONSTANTS } from "@/lib/constants";

export interface ChannelServer {
  server_name: string;
  api_url: string;
  test_mode: number;
}

export interface Channel {
  broker_name: string;
  channel_status: string;
  login_status: string;
}

/** Create a one-off Axios instance for a specific server's api_url */
function serverClient(apiUrl: string) {
  const client = axios.create({ baseURL: apiUrl, timeout: 15_000 });
  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });
  return client;
}

export const channelApi = {
  getServerList: () =>
    apiRequest<{ server_list: ChannelServer[] }>({
      url: CONSTANTS.API.CHANNEL.SERVER_LIST,
      client: faqApi,
    }),

  getChannelList: (apiUrl: string) =>
    serverClient(apiUrl)
      .get(CONSTANTS.API.CHANNEL.LIST)
      .then((res) => res.data),

  setServerFeedMode: (mode: boolean, apiUrl: string) =>
    serverClient(apiUrl)
      .post(`${CONSTANTS.API.CHANNEL.MODE}?test_mode=${mode ? 1 : 0}`, { mode: mode ? 1 : 0 })
      .then((res) => res.data),

  switchChannel: (bname: string, apiUrl: string) =>
    serverClient(apiUrl)
      .get(CONSTANTS.API.CHANNEL.SWITCH, { params: { bname } })
      .then((res) => res.data),

  startStopChannel: (bname: string, action: "start" | "stop", apiUrl: string) =>
    serverClient(apiUrl)
      .get(CONSTANTS.API.CHANNEL.START_STOP, { params: { bname, action } })
      .then((res) => res.data),

  getConnectionDetails: () =>
    apiRequest({ url: CONSTANTS.API.CHANNEL.CONN_DETAILS, client: faqApi }),
};
