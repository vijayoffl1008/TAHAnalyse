// ── Tradeboard (tradeboard/ — ORDER_BASE_URL) ─────────────────────────────────

export type ProductType = "MIS" | "NRML";
export type OptionType = "CE" | "PE";
export type OrderType = "MARKET" | "LIMIT";

export interface TradeboardUser {
  user_id: string;
  broker_account_id: string;
}

export interface TradeboardSettings {
  symbol: string;
  product_type: ProductType;
  users: TradeboardUser[];
  strike?: number;
  option_type?: OptionType;
  order_type?: OrderType;
  target?: number;
  sl?: number;
  tsl?: number;
}

export interface Tradeboard {
  name: string;
  settings: TradeboardSettings;
  created_at?: string;
}

export interface AddTradeboardDTO {
  name: string;
  settings: TradeboardSettings;
}

export interface UpdateTradeboardDTO extends AddTradeboardDTO {
  _id?: string;
}
