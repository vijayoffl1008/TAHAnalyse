// ── Symbols / Contracts ───────────────────────────────────────────────────────

export interface Exchange {
  _id: string;
  name: string;
}

export interface Segment {
  _id: string;
  name: string;
}

export interface TradingSymbol {
  _id: string;
  name: string;
  trading_symbol: string;
}

export interface SymbolsQueryDTO {
  exchange?: string;
  segment?: string;
}
