// ── Instrument (instrument/*) ─────────────────────────────────────────────────

export interface Instrument {
  _id: string;
  name: string;
  display_name: string;
  symbol: string;
  derivative_contract: string;
  spot_contract: string;
  state: "active" | "inactive";
}

export interface InstrumentExpiry {
  _id: string;
  instrument_id: string;
  year: number;
  month: number;
  expiry_date: string;
}

export interface AddInstrumentDTO {
  name: string;
  display_name: string;
  symbol: string;
  derivative_contract: string;
  spot_contract: string;
}

export interface UpdateInstrumentDTO extends AddInstrumentDTO {
  _id: string;
}

export interface AddInstrumentExpiryDTO {
  instrument_id: string;
  year: number;
  month: number;
  expiry_date: string;
}
