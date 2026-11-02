/**
 * Strategy data transformation utilities.
 * Ported from AlgoHopperBot StrategyHelper (Angular Injectable → pure TS module).
 */

import { CONSTANTS } from "./constants";
import { Thread } from "../types/thread";

// ── Thread row (Thread list table display model) ──────────────────────────────

export interface ThreadRow {
  id: string;
  strategy_name: string;
  dname_edit: { mode: boolean; text: string };
  symbol: string | null;
  broker: string;
  state: string;
  entry_time: string;
  exit_time: string;
  entry_exit_time: string;
  enabled: boolean;
  original: unknown;
}

export function toThreadRow(thread: Record<string, any>): ThreadRow {
  let entry_exit_time = "";
  if (thread.settings?.entry_time) {
    entry_exit_time = thread.settings.entry_time;
  }
  if (thread.settings?.exit_time) {
    if (entry_exit_time) entry_exit_time += "/";
    entry_exit_time += thread.settings.exit_time;
  }

  return {
    id: thread._id,
    strategy_name: thread.display_name,
    dname_edit: { mode: false, text: thread.display_name },
    symbol: thread.settings?.symbol?.trading_symbol ?? null,
    broker: thread.ba
      ? `${thread.ba.name}/${thread.ba.client_id}`
      : "",
    state: thread.state,
    entry_time: thread.settings?.entry_time ?? "",
    exit_time: thread.settings?.exit_time ?? "",
    entry_exit_time,
    enabled: thread.status === "enabled",
    original: thread,
  };
}

// ── Default settings factories ────────────────────────────────────────────────

export function getLssV1DefaultSettings(
  strategy: Record<string, any>,
  exchange: string,
  ba: Record<string, any>,
  user: Record<string, any>
) {
  const original = {
    strategy,
    ba: ba.original ?? ba,
    user,
    script: "internal",
    script_details: {},
    status: "disabled",
    settings: {
      exchange,
      segment: null,
      symbol: null,
      strike_diff: 0,
      run_mode: "live",
      tgt: { state: "disabled", type: "", value: 0 },
      sl: { state: "disabled", type: "", value: 0 },
      tsl: { state: "disabled", type: "", value: 0 },
      strike_selection: { type: "default", value: { ce: 0, pe: 0 } },
      straddle_type: "buy",
      lots: 1,
      days: [...CONSTANTS.DAYS],
      trade_type: "mis",
      timeframe: "minute",
      interval: 1,
      entry_time: "09:20",
      exit_time: "15:15",
      reenter: { state: "disabled", on: "", count: 0 },
    },
  };

  return buildDefaultRow(strategy, ba, original, "09:20/15:15");
}

export function getOrbV1DefaultSettings(
  strategy: Record<string, any>,
  symbol: Record<string, any>,
  ba: Record<string, any>,
  user: Record<string, any>
) {
  const original = {
    strategy,
    ba: ba.original ?? ba,
    user,
    script: "internal",
    script_details: {},
    status: "disabled",
    settings: {
      category: "INDEX",
      segment: "SPOT",
      symbol,
      strike_diff: symbol?.instrument?.option_details?.strike_diff ?? 0,
      run_mode: { which: "live", value: { telegram_id: "" } },
      tgt: { state: "disabled", type: "", value_type: "", value: 0 },
      sl: { state: "disabled", type: "", value_type: "", value: 0 },
      tsl: { state: "disabled", type: "", value: 0 },
      strike_selection: {
        segment: "spot",
        type: "default",
        value: { min: 0, max: 0 },
      },
      entry_side: "buy",
      lots: 1,
      days: [...CONSTANTS.DAYS],
      trade_type: "mis",
      timeframe: "minute",
      interval: 1,
      entry_time: "09:20",
      buffer_time: "15:00",
      exit_time: "15:15",
      reenter: {
        state: "disabled",
        on: "",
        what: "",
        freq: "",
        count: 0,
      },
      order_adjustment: {
        state: "disabled",
        sl: { state: "disabled", type: "" },
        tgt: { state: "disabled", type: "" },
      },
    },
  };

  return buildDefaultRow(strategy, ba, original, "09:20/15:15");
}

export function getDefaultSettings(
  strategy: Record<string, any>,
  exchange: string | Record<string, any>,
  ba: Record<string, any>,
  user: Record<string, any>
) {
  const name = strategy.name?.toLowerCase();
  if (name === "lss_v1") return getLssV1DefaultSettings(strategy, exchange as string, ba, user);
  if (name === "orb_v1") return getOrbV1DefaultSettings(strategy, exchange as Record<string, any>, ba, user);
  return null;
}

// ── Internal helper ───────────────────────────────────────────────────────────

function buildDefaultRow(
  strategy: Record<string, any>,
  ba: Record<string, any>,
  original: Record<string, any>,
  entryExitTime: string
) {
  return {
    strategy_name: strategy.display_name,
    dname_edit: { mode: false, text: strategy.display_name },
    symbol: original.settings.symbol?.trading_symbol ?? null,
    broker: `${ba.name}/${ba.client_id}`,
    state: CONSTANTS.STRATEGY_STATES.STOPPED,
    entry_time: "",
    exit_time: "",
    entry_exit_time: entryExitTime,
    enabled: false,
    original,
  };
}
