// ── Order & Position (order, position — ORDER_BASE_URL) ───────────────────────

export interface Order {
  _id: string;
  order_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  status: string;
  broker_account: string;
  user_id: string;
  emsg?: string;
}

export interface Position {
  _id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  avg_price: number;
  pnl: number;
  broker_account: string;
  user_id: string;
}

export interface CancelOrderDTO {
  order_id: string;
  bacc_id: string;
  user_id: string;
}

export interface ClosePositionDTO {
  symbol: string;
  bacc_id: string;
  user_id: string;
}
