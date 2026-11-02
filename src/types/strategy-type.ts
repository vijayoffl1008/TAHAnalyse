/**
 * Layer 1: Strategy Type Definition (the registry entry).
 * Ported from AlgoHopperBot's Strategy entity.
 *
 * builder_mode drives which UI the Strategy Builder renders:
 *   'indicator' → TAHAnalyse EnhancedCreateStrategyDialog (indicator/condition wizard)
 *   'layout'    → DynamicForm sections from config_schema (e.g. lss_v1, orb_v1)
 *   'combined'  → both (price action + indicators + custom scripts)
 *
 * config_schema and builder_mode are reserved for the post-migration dynamic
 * form phase. For now they are optional and unused during migration.
 */

export type StrategyScriptType = "internal" | "external";
export type StrategyScope = "public" | "private";
export type StrategyBuilderMode = "indicator" | "layout" | "combined";

export interface StrategyTypeDefinition {
  _id: string;
  name: string;
  display_name: string;
  script_type: StrategyScriptType;
  capital_config?: Record<string, unknown>;
  scope: StrategyScope;
  state: "active" | "inactive";

  // Post-migration: dynamic form config (deferred — Decision 17)
  builder_mode?: StrategyBuilderMode;
  supports_indicators?: boolean;
  supports_custom_indicators?: boolean;
  config_schema?: unknown;
}

export interface AddStrategyTypeDTO {
  name: string;
  display_name: string;
  script_type: StrategyScriptType;
  capital_config?: Record<string, unknown>;
  scope: StrategyScope;
}

export interface UpdateStrategyTypeDTO extends AddStrategyTypeDTO {
  _id: string;
}

export interface UpdateStrategyStateDTO {
  _id: string;
  state: "active" | "inactive";
}

export interface UpdateStrategyScopeDTO {
  _id: string;
  scope: StrategyScope;
}
