import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ReentrySettings, ReentryType, IndicatorConfig, StrategyDuration, ConditionGroup } from '@/types/strategy';
import { EnhancedConditionsBuilder } from './EnhancedConditionsBuilder';

interface ReentrySettingsBuilderProps {
  reentrySettings: ReentrySettings;
  indicators: IndicatorConfig[];
  onReentrySettingsChange: (settings: ReentrySettings) => void;
  strategyDuration: StrategyDuration;
}

const reentryTypeOptions: { value: ReentryType; label: string; description: string }[] = [
  { value: 'NO_REENTRY', label: 'No Re-entry', description: 'Do not re-enter after exit' },
  { value: 'ON_SL', label: 'Re-enter on Stop Loss', description: 'Allow re-entry only when stopped out' },
  { value: 'ON_TGT', label: 'Re-enter on Target', description: 'Allow re-entry only when target is hit' },
  { value: 'ON_BOTH', label: 'Re-enter on Both', description: 'Allow re-entry on both SL and target' },
  { value: 'CUSTOM', label: 'Custom Conditions', description: 'Define custom re-entry conditions' }
];

export function ReentrySettingsBuilder({
  reentrySettings,
  indicators,
  onReentrySettingsChange,
  strategyDuration
}: ReentrySettingsBuilderProps) {

  const updateSettings = (updates: Partial<ReentrySettings>) => {
    onReentrySettingsChange({ ...reentrySettings, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Re-entry Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Re-entry Type</Label>
          <Select
            value={reentrySettings.type}
            onValueChange={(type: ReentryType) => {
              const baseUpdate = { type };
              // Reset other fields when type changes
              if (type === 'NO_REENTRY') {
                onReentrySettingsChange(baseUpdate);
              } else {
                updateSettings(baseUpdate);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reentryTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reentrySettings.type !== 'NO_REENTRY' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Maximum Re-entries</Label>
              <Input
                type="number"
                value={reentrySettings.maxReentries || 1}
                onChange={(e) => updateSettings({ maxReentries: Number(e.target.value) })}
                placeholder="Enter max re-entries"
                min="1"
                max="10"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of times the strategy can re-enter (0 = unlimited)
              </p>
            </div>

            {reentrySettings.type === 'CUSTOM' && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Custom Re-entry Conditions</Label>
                <EnhancedConditionsBuilder
                  conditionGroups={reentrySettings.conditions ? [{
                    id: 'reentry_conditions',
                    conditions: reentrySettings.conditions,
                    logicalOperator: 'AND'
                  }] : []}
                  indicators={indicators}
                  onConditionsChange={(groups) => {
                    const conditions = groups.length > 0 ? groups[0].conditions : [];
                    updateSettings({ conditions });
                  }}
                  title="Re-entry Conditions"
                />
              </div>
            )}

            {/* Special Scenarios for Different Durations */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Special Scenarios for {strategyDuration === 'intraday' ? 'Intraday' : 'Positional'} Trading
              </Label>
              
              {strategyDuration === 'intraday' && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium">Intraday Specific Rules</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• If SL is hit, should it follow the original entry conditions for re-entry?</p>
                    <p>• Should re-entry be allowed in the last hour of trading?</p>
                    <p>• Maximum number of re-entries per trading session?</p>
                  </div>
                </div>
              )}

              {strategyDuration === 'positional' && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium">Positional Specific Rules</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• If day opens with gap up/down, how should existing positions be handled?</p>
                    <p>• Should re-entry wait for gap fill or proceed with current conditions?</p>
                    <p>• Should weekend gaps be treated differently?</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}