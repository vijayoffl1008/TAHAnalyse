import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Strategy, 
  IndicatorConfig, 
  ConditionGroup, 
  ExitCondition, 
  ReentrySettings, 
  SpecialScenario 
} from '@/types/strategy';
import { getAllIndicatorDefinition } from '@/data/allIndicatorDefinitions';

interface StrategySummaryProps {
  formData: {
    name: string;
    description: string;
    type: string;
    duration: string;
    direction: string;
  };
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
}

export function StrategySummary({
  formData,
  indicators,
  entryConditions,
  exitConditions,
  reentrySettings,
  specialScenarios
}: StrategySummaryProps) {

  const getConditionSummary = (groups: ConditionGroup[]) => {
    return groups.map((group, groupIndex) => (
      <div key={group.id} className="text-sm">
        <span className="font-medium">Group {groupIndex + 1}:</span>
        <div className="ml-4 space-y-1">
          {group.conditions.map((condition, condIndex) => (
            <div key={condition.id} className="text-muted-foreground">
              {condIndex > 0 && <span className="text-xs">{condition.logicalOperator} </span>}
              {condition.leftOperand.type === 'indicator' 
                ? `${condition.leftOperand.indicatorId}.${condition.leftOperand.value}`
                : condition.leftOperand.value
              } {condition.operator} {
                condition.rightOperand.type === 'indicator'
                  ? `${condition.rightOperand.indicatorId}.${condition.rightOperand.value}`
                  : condition.rightOperand.value
              }
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const getExitSummary = (exits: ExitCondition[]) => {
    return exits.map((exit, index) => (
      <div key={exit.id} className="text-sm">
        <span className="font-medium">{exit.type}:</span>
        <span className="ml-2 text-muted-foreground">
          {exit.type === 'SL' || exit.type === 'TGT' 
            ? `${exit.percentage}%${exit.value ? ` (Fixed: ${exit.value})` : ''}`
            : exit.type === 'SAR' 
              ? `${exit.sarSettings?.useOnlySL ? 'Stop Loss Only' : 'Stop & Reverse'} - ${exit.sarSettings?.priority} priority`
              : `${exit.conditions?.length || 0} conditions`
          }
        </span>
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Strategy Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{formData.name}</h3>
          <p className="text-muted-foreground">{formData.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formData.type.replace('_', ' ')}</Badge>
            <Badge variant="outline">{formData.duration}</Badge>
            <Badge variant="outline">{formData.direction}</Badge>
          </div>
        </div>

        <Separator />

        {/* Indicators */}
        <div className="space-y-3">
          <h4 className="font-semibold">Indicators ({indicators.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {indicators.map((indicator) => {
              const definition = getAllIndicatorDefinition(indicator.type);
              return (
                <div key={indicator.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium text-sm">{definition?.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(indicator.parameters).map(([key, value]) => (
                      <span key={key}>{key}: {String(value)} </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Entry Conditions */}
        <div className="space-y-3">
          <h4 className="font-semibold">Entry Conditions</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Buy Conditions ({entryConditions.buy.length} groups)</h5>
              {entryConditions.buy.length > 0 ? (
                <div className="space-y-2">
                  {getConditionSummary(entryConditions.buy)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No buy conditions defined</p>
              )}
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-2">Sell Conditions</h5>
              {entryConditions.reverseSellFromBuy ? (
                <p className="text-sm text-muted-foreground">Reversed from buy conditions</p>
              ) : entryConditions.sell.length > 0 ? (
                <div className="space-y-2">
                  {getConditionSummary(entryConditions.sell)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sell conditions defined</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Exit Conditions */}
        <div className="space-y-3">
          <h4 className="font-semibold">Exit Conditions</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Buy Exit ({exitConditions.buy.length} conditions)</h5>
              {exitConditions.buy.length > 0 ? (
                <div className="space-y-1">
                  {getExitSummary(exitConditions.buy)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No buy exit conditions defined</p>
              )}
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-2">Sell Exit ({exitConditions.sell.length} conditions)</h5>
              {exitConditions.sell.length > 0 ? (
                <div className="space-y-1">
                  {getExitSummary(exitConditions.sell)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sell exit conditions defined</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Re-entry Settings */}
        <div className="space-y-3">
          <h4 className="font-semibold">Re-entry Settings</h4>
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <Badge variant="outline">{reentrySettings.type.replace('_', ' ')}</Badge>
            </div>
            {reentrySettings.maxReentries && (
              <div className="mt-2">
                <span className="font-medium">Max Re-entries:</span>
                <span className="ml-2 text-muted-foreground">{reentrySettings.maxReentries}</span>
              </div>
            )}
            {reentrySettings.conditions && reentrySettings.conditions.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Custom Conditions:</span>
                <span className="ml-2 text-muted-foreground">{reentrySettings.conditions.length} conditions defined</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Special Scenarios */}
        <div className="space-y-3">
          <h4 className="font-semibold">Special Scenarios ({specialScenarios.length})</h4>
          {specialScenarios.length > 0 ? (
            <div className="space-y-2">
              {specialScenarios.map((scenario) => (
                <div key={scenario.id} className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="font-medium text-sm">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {scenario.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{scenario.actions.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {scenario.triggerConditions.length} trigger conditions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No special scenarios defined</p>
          )}
        </div>

        {/* Validation Status */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-2">
            Strategy Validation
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={indicators.length > 0 ? 'text-green-600' : 'text-red-600'}>
                ✓ {indicators.length} Indicators configured
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={entryConditions.buy.length > 0 || entryConditions.sell.length > 0 ? 'text-green-600' : 'text-red-600'}>
                ✓ Entry conditions defined
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={exitConditions.buy.length > 0 || exitConditions.sell.length > 0 ? 'text-green-600' : 'text-yellow-600'}>
                {exitConditions.buy.length > 0 || exitConditions.sell.length > 0 ? '✓' : '⚠'} Exit conditions {exitConditions.buy.length > 0 || exitConditions.sell.length > 0 ? 'configured' : 'recommended'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">
                ✓ Re-entry settings configured
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}