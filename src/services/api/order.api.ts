/**
 * Order & Position API — Django ORDER_BASE_URL (orderApi).
 * Ported from AlgoHopperBot OrderService + PositionService.
 */

import { orderApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export interface OrderRow {
  bacc_id: string;
  time: string;
  trading_symbol: string;
  transaction_type: string;
  qty_filled: string;
  product_type: string;
  price_trg_price: string;
  average_price: number;
  exchange: string;
  token: string;
  status: string;
}

export interface PositionRow {
  bacc_id: string;
  product_type: string;
  trading_symbol: string;
  qty: string;
  exchange: string;
  token: string;
  buy_avg_price: number;
  sell_avg_price: string;
  pnl: string;
  show_close: boolean;
}

export const orderApiService = {
  getOrders: (userId: string) =>
    apiRequest<{ data: { emsg: string; orders: any[] }[] }>({
      url: CONSTANTS.API.ORDER.GET_ORDERS,
      params: { user_id: userId },
      client: orderApi,
    }),

  cancelOrder: (userId: string, baccId: string, data: Record<string, unknown>) =>
    orderApi
      .delete(CONSTANTS.API.ORDER.CANCEL_ORDER, { params: { user_id: userId, bacc_id: baccId }, data })
      .then((res) => res.data),
};

export const positionApiService = {
  getPositions: (userId: string) =>
    apiRequest<{ data: { emsg: string; positions: any[] }[] }>({
      url: CONSTANTS.API.POSITION.GET_POSITIONS,
      params: { user_id: userId },
      client: orderApi,
    }),

  closePosition: (userId: string, baccId: string, data: Record<string, unknown>) =>
    orderApi
      .delete(CONSTANTS.API.ORDER.CANCEL_ORDER, { params: { user_id: userId, bacc_id: baccId }, data })
      .then((res) => res.data),
};
