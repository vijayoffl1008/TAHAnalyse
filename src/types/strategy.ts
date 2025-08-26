export type StrategyType = 'trend_following' | 'mean_reversion' | 'momentum' | 'breakout' | 'custom';

export type StrategyDuration = 'intraday' | 'positional';

export type StrategyDirection = 'buy' | 'sell' | 'both';

export type IndicatorType = 'MA' | 'RSI' | 'MACD' | 'BB' | 'STOCH' | 'ADX' | 'ATR' | 'CCI' | 'ROC' | 'MFI' | 'OBV' | 'VWAP' | 'PIVOT' | 'FIBO' | 'ICHIMOKU' | 'WILLIAMS_R' | 'AROON' | 'KELTNER' | 'DONCHIAN' | 'PARABOLIC_SAR';

export type ConditionOperator = 'greater_than' | 'less_than' | 'equal' | 'crosses_above' | 'crosses_below' | 'between';

export type LogicalOperator = 'AND' | 'OR';

export type ExitType = 'SL' | 'TGT' | 'SAR' | 'CONDITION';

export type ReentryType = 'none' | 'NO_REENTRY' | 'ON_SL' | 'ON_TGT' | 'ON_BOTH' | 'CUSTOM';

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  parameters: Record<string, string | number | boolean>;
}

export interface Condition {
  id: string;
  leftOperand: {
    type: 'indicator' | 'price' | 'value';
    value: string | number;
    indicatorId?: string;
  };
  operator: ConditionOperator;
  rightOperand: {
    type: 'indicator' | 'price' | 'value';
    value: string | number;
    indicatorId?: string;
  };
  logicalOperator?: LogicalOperator;
}

export interface ConditionGroup {
  id: string;
  conditions: Condition[];
  logicalOperator?: LogicalOperator;
}

export interface ExitCondition {
  id: string;
  type: ExitType;
  value?: number;
  percentage?: number;
  conditions?: Condition[];
  sarSettings?: {
    useOnlySL: boolean;
    priority: 'first' | 'last';
  };
}

export interface ReentrySettings {
  type: ReentryType;
  maxReentries?: number;
  conditions?: Condition[];
  specialScenarios?: SpecialScenario[];
}

export interface SpecialScenario {
  id: string;
  name: string;
  description: string;
  triggerConditions: Condition[];
  actions: {
    type: 'EXIT' | 'HOLD' | 'REVERSE' | 'CUSTOM';
    customLogic?: string;
  };
  applicableFor: StrategyDuration[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  duration: StrategyDuration;
  direction: StrategyDirection;
  indicators: IndicatorConfig[];
  entryConditions: {
    buy: ConditionGroup[];
    sell: ConditionGroup[];
    reverseSellFromBuy: boolean;
  };
  exitConditions: {
    buy: ExitCondition[];
    sell: ExitCondition[];
  };
  reentrySettings: ReentrySettings;
  specialScenarios: SpecialScenario[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface IndicatorDefinition {
  type: IndicatorType;
  name: string;
  description: string;
  category: string;
  parameters: {
    name: string;
    label: string;
    type: 'number' | 'select' | 'boolean';
    defaultValue: string | number | boolean;
    options?: { label: string; value: string | number | boolean }[];
    min?: number;
    max?: number;
    step?: number;
    required: boolean;
  }[];
  outputs: {
    name: string;
    label: string;
    description: string;
  }[];
}