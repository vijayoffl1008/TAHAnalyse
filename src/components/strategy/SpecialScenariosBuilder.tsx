import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings } from 'lucide-react';
import { SpecialScenario, IndicatorConfig, StrategyDuration, ConditionGroup } from '@/types/strategy';
import { EnhancedConditionsBuilder } from './EnhancedConditionsBuilder';

interface SpecialScenariosBuilderProps {
  specialScenarios: SpecialScenario[];
  indicators: IndicatorConfig[];
  onSpecialScenariosChange: (scenarios: SpecialScenario[]) => void;
  strategyDuration: StrategyDuration;
}

const actionTypeOptions = [
  { value: 'EXIT', label: 'Exit Position', description: 'Close current position immediately' },
  { value: 'HOLD', label: 'Hold Position', description: 'Maintain current position' },
  { value: 'REVERSE', label: 'Reverse Position', description: 'Close and take opposite position' },
  { value: 'CUSTOM', label: 'Custom Logic', description: 'Execute custom logic' }
];

const predefinedScenarios = {
  intraday: [
    {
      name: 'Gap Opening',
      description: 'Handle gap up/down at market opening',
      defaultAction: 'CUSTOM'
    },
    {
      name: 'High Volatility',
      description: 'Market volatility exceeds threshold',
      defaultAction: 'EXIT'
    },
    {
      name: 'End of Day',
      description: 'Near market closing time',
      defaultAction: 'EXIT'
    },
    {
      name: 'News Event',
      description: 'Major economic news release',
      defaultAction: 'HOLD'
    }
  ],
  positional: [
    {
      name: 'Weekend Gap',
      description: 'Gap opening after weekend',
      defaultAction: 'CUSTOM'
    },
    {
      name: 'Earnings Announcement',
      description: 'Stock earnings announcement',
      defaultAction: 'EXIT'
    },
    {
      name: 'Market Circuit Breaker',
      description: 'Market circuit breaker triggered',
      defaultAction: 'HOLD'
    },
    {
      name: 'Holiday Trading',
      description: 'Trading on market holidays',
      defaultAction: 'EXIT'
    }
  ]
};

export function SpecialScenariosBuilder({
  specialScenarios,
  indicators,
  onSpecialScenariosChange,
  strategyDuration
}: SpecialScenariosBuilderProps) {

  const [showPredefined, setShowPredefined] = useState(false);

  const addCustomScenario = () => {
    const newScenario: SpecialScenario = {
      id: `scenario_${Date.now()}`,
      name: '',
      description: '',
      triggerConditions: [],
      actions: {
        type: 'EXIT'
      },
      applicableFor: [strategyDuration]
    };
    onSpecialScenariosChange([...specialScenarios, newScenario]);
  };

  const addPredefinedScenario = (predefined: typeof predefinedScenarios.intraday[0]) => {
    const newScenario: SpecialScenario = {
      id: `scenario_${Date.now()}`,
      name: predefined.name,
      description: predefined.description,
      triggerConditions: [],
      actions: {
        type: predefined.defaultAction as 'EXIT' | 'HOLD' | 'REVERSE' | 'CUSTOM'
      },
      applicableFor: [strategyDuration]
    };
    onSpecialScenariosChange([...specialScenarios, newScenario]);
    setShowPredefined(false);
  };

  const updateScenario = (id: string, updates: Partial<SpecialScenario>) => {
    const updatedScenarios = specialScenarios.map(scenario =>
      scenario.id === id ? { ...scenario, ...updates } : scenario
    );
    onSpecialScenariosChange(updatedScenarios);
  };

  const deleteScenario = (id: string) => {
    onSpecialScenariosChange(specialScenarios.filter(scenario => scenario.id !== id));
  };

  const currentPredefined = predefinedScenarios[strategyDuration];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Special Scenarios ({specialScenarios.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPredefined(!showPredefined)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Predefined
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={addCustomScenario}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Custom Scenario
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Predefined Scenarios */}
        {showPredefined && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-md">
                Predefined Scenarios for {strategyDuration === 'intraday' ? 'Intraday' : 'Positional'} Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPredefined.map((predefined, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => addPredefinedScenario(predefined)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm">{predefined.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {predefined.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {actionTypeOptions.find(a => a.value === predefined.defaultAction)?.label}
                        </span>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configured Scenarios */}
        {specialScenarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No special scenarios configured</p>
            <p className="text-sm">Add predefined scenarios or create custom ones for specific market conditions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {specialScenarios.map((scenario) => (
              <Card key={scenario.id} className="border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={scenario.name}
                        onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                        placeholder="Scenario name"
                        className="font-medium"
                      />
                      <Textarea
                        value={scenario.description}
                        onChange={(e) => updateScenario(scenario.id, { description: e.target.value })}
                        placeholder="Describe when this scenario should trigger"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteScenario(scenario.id)}
                      className="text-destructive hover:text-destructive ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Action Configuration */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Action to Take</Label>
                    <Select
                      value={scenario.actions.type}
                      onValueChange={(type: 'EXIT' | 'HOLD' | 'REVERSE' | 'CUSTOM') => 
                        updateScenario(scenario.id, {
                          actions: { ...scenario.actions, type }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {scenario.actions.type === 'CUSTOM' && (
                      <Textarea
                        value={scenario.actions.customLogic || ''}
                        onChange={(e) => updateScenario(scenario.id, {
                          actions: { ...scenario.actions, customLogic: e.target.value }
                        })}
                        placeholder="Describe the custom logic to execute"
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Trigger Conditions */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Trigger Conditions</Label>
                    <EnhancedConditionsBuilder
                      conditionGroups={scenario.triggerConditions.length > 0 ? [{
                        id: `trigger_${scenario.id}`,
                        conditions: scenario.triggerConditions,
                        logicalOperator: 'AND'
                      }] : []}
                      indicators={indicators}
                      onConditionsChange={(groups) => {
                        const conditions = groups.length > 0 ? groups[0].conditions : [];
                        updateScenario(scenario.id, { triggerConditions: conditions });
                      }}
                      title="When should this scenario trigger?"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}