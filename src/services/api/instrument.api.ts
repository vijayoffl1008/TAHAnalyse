/**
 * Instrument API — Django backend (faqApi).
 * Ported from AlgoHopperBot InstrumentService.
 *
 * NOTE: activateInstrument uses delete() in Angular (not what it sounds like).
 * Preserved as GET-with-params following the pattern.
 */

import { faqApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export const instrumentApi = {
  listInstruments: (params?: { index?: number; limit?: number }) =>
    apiRequest<{ instruments: any[]; total_count: number }>({
      url: CONSTANTS.API.INSTRUMENT.GET_INSTRUMENTS,
      params: params as Record<string, unknown>,
      client: faqApi,
    }),

  addInstrument: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.INSTRUMENT.ADD_INSTRUMENT, data, method: "post", client: faqApi }),

  updateInstrument: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.INSTRUMENT.UPDATE_INSTRUMENT, data, method: "put", client: faqApi }),

  /** Angular activateInstrument calls delete(url, data) — data treated as base_url. Replicate correctly. */
  activateInstrument: (id: string, state: number) =>
    apiRequest({ url: CONSTANTS.API.INSTRUMENT.DELETE_INSTRUMENT, params: { _id: id, state }, client: faqApi }),

  listInstrumentsExpiry: (instrumentId: string, year: string, month: string) =>
    apiRequest({ url: CONSTANTS.API.INSTRUMENT.GET_INSTRUMENTS_EXPIRY, params: { instrument_id: instrumentId, year, month }, client: faqApi }),

  addInstrumentExpiry: (data: Record<string, unknown>) =>
    apiRequest({ url: CONSTANTS.API.INSTRUMENT.ADD_INSTRUMENT_EXPIRY, data, method: "put", client: faqApi }),

  deleteInstrumentExpiry: (data: Record<string, unknown>) =>
    faqApi.delete(CONSTANTS.API.INSTRUMENT.DELETE_INSTRUMENT_EXPIRY, { params: data }).then((r) => r.data),
};
