import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ExitCondition, IndicatorConfig, Condition, ConditionGroup } from '@/types/strategy';
import { EnhancedConditionsBuilder } from './EnhancedConditionsBuilder';

interface EnhancedExitConditionsBuilderProps {
  exitConditions: {
    buy: ExitCondition[];
    sell: ExitCondition[];
  };
  onExitConditionsChange: (conditions: { buy: ExitCondition[]; sell: ExitCondition[] }) => void;
  indicators: IndicatorConfig[];
  entryConditions?: {
    buy: ConditionGroup[];
    sell: ConditionGroup[];
  };
  strategyDirection: 'buy' | 'sell' | 'both';
}

export function EnhancedExitConditionsBuilder({ 
  exitConditions, 
  onExitConditionsChange, 
  indicators,
  entryConditions,
  strategyDirection
}: EnhancedExitConditionsBuilderProps) {
  const [reverseEntryForExit, setReverseEntryForExit] = useState<{[key: string]: boolean}>({});

  // Initialize reverse state based on existing exit conditions
  useEffect(() => {
    const newReverseState: {[key: string]: boolean} = {};
    
    [...exitConditions.buy, ...exitConditions.sell].forEach(condition => {
      if (condition.type === 'CONDITION' && condition.conditions && condition.conditions.length > 0) {
        // Check if conditions have reversed indicators (reversed_ prefix)
        const hasReversedConditions = condition.conditions.some(cond => 
          cond.id.startsWith('reversed_')
        );
        if (hasReversedConditions) {
          newReverseState[condition.id] = true;
        }
      }
    });
    
    setReverseEntryForExit(newReverseState);
  }, [exitConditions]);

  const addExitCondition = (side: 'buy' | 'sell', type: 'SL' | 'TGT' | 'SAR' | 'CONDITION') => {
    const newCondition: ExitCondition = {
      id: `exit_${Date.now()}`,
      type,
      priority: exitConditions[side].length + 1,
      ...(type === 'SL' && { percentage: 2 }),
      ...(type === 'TGT' && { percentage: 5 }),
      ...(type === 'SAR' && { 
        sarSettings: { 
          useOnlySL: false, 
          priority: exitConditions[side].length + 1 
        } 
      }),
      ...(type === 'CONDITION' && { conditions: [] })
    };

    onExitConditionsChange({
      ...exitConditions,
      [side]: [...exitConditions[side], newCondition]
    });
  };

  const updateExitCondition = (side: 'buy' | 'sell', updatedCondition: ExitCondition) => {
    onExitConditionsChange({
      ...exitConditions,
      [side]: exitConditions[side].map(condition =>
        condition.id === updatedCondition.id ? updatedCondition : condition
      )
    });
  };

  const removeExitCondition = (side: 'buy' | 'sell', id: string) => {
    onExitConditionsChange({
      ...exitConditions,
      [side]: exitConditions[side].filter(condition => condition.id !== id)
    });
  };

  const movePriority = (side: 'buy' | 'sell', id: string, direction: 'up' | 'down') => {
    const conditions = [...exitConditions[side]];
    const index = conditions.findIndex(c => c.id === id);
    
    if (direction === 'up' && index > 0) {
      [conditions[index], conditions[index - 1]] = [conditions[index - 1], conditions[index]];
    } else if (direction === 'down' && index < conditions.length - 1) {
      [conditions[index], conditions[index + 1]] = [conditions[index + 1], conditions[index]];
    }

    // Update priority numbers
    conditions.forEach((condition, idx) => {
      condition.priority = idx + 1;
    });

    onExitConditionsChange({
      ...exitConditions,
      [side]: conditions
    });
  };

  const reverseEntryConditions = (entryConditions: ConditionGroup[]): Condition[] => {
    const reversedConditions: Condition[] = [];
    
    entryConditions.forEach(group => {
      group.conditions.forEach(condition => {
        const reversedCondition: Condition = {
          ...condition,
          id: `reversed_${condition.id}`,
          operator: reverseOperator(condition.operator)
        };
        reversedConditions.push(reversedCondition);
      });
    });

    return reversedConditions;
  };

  const reverseOperator = (operator: string) => {
    const operatorMap: Record<string, string> = {
      'greater_than': 'less_than',
      'less_than': 'greater_than',
      'crosses_above': 'crosses_below',
      'crosses_below': 'crosses_above',
      'equal': 'equal',
      'between': 'between'
    };
    return operatorMap[operator] || operator;
  };

  const renderExitCondition = (condition: ExitCondition, side: 'buy' | 'sell', index: number) => (
    <Card key={condition.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Priority {condition.priority}</Badge>
            <Badge variant={condition.type === 'SL' ? 'destructive' : condition.type === 'TGT' ? 'default' : 'secondary'}>
              {condition.type}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => movePriority(side, condition.id, 'up')}
              disabled={index === 0}
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => movePriority(side, condition.id, 'down')}
              disabled={index === exitConditions[side].length - 1}
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeExitCondition(side, condition.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {condition.type === 'SL' && (
          <div className="space-y-2">
            <Label>Stop Loss Percentage</Label>
            <Input
              type="number"
              value={condition.percentage || 2}
              onChange={(e) => updateExitCondition(side, { ...condition, percentage: Number(e.target.value) })}
              step="0.1"
              min="0.1"
              max="50"
            />
          </div>
        )}

        {condition.type === 'TGT' && (
          <div className="space-y-2">
            <Label>Target Percentage</Label>
            <Input
              type="number"
              value={condition.percentage || 5}
              onChange={(e) => updateExitCondition(side, { ...condition, percentage: Number(e.target.value) })}
              step="0.1"
              min="0.1"
              max="100"
            />
          </div>
        )}

        {condition.type === 'SAR' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={condition.sarSettings?.useOnlySL || false}
                onCheckedChange={(checked) => 
                  updateExitCondition(side, { 
                    ...condition, 
                    sarSettings: { 
                      ...condition.sarSettings, 
                      useOnlySL: checked as boolean 
                    } 
                  })
                }
              />
              <Label className="text-sm">Use only for Stop Loss</Label>
            </div>
          </div>
        )}

        {condition.type === 'CONDITION' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exit Conditions</Label>
              {entryConditions && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={reverseEntryForExit[condition.id] || false}
                    onCheckedChange={(checked) => {
                      setReverseEntryForExit(prev => ({
                        ...prev,
                        [condition.id]: checked as boolean
                      }));
                      if (checked) {
                        // For buy exit, reverse sell entry (or buy if no sell)
                        // For sell exit, reverse buy entry
                        const sourceConditions = side === 'buy' 
                          ? (entryConditions.sell && entryConditions.sell.length > 0 ? entryConditions.sell : entryConditions.buy)
                          : entryConditions.buy;
                        
                        if (sourceConditions && sourceConditions.length > 0) {
                          const reversedConditions = reverseEntryConditions(sourceConditions);
                          
                          // If we're reversing sell entry conditions that have additional custom conditions,
                          // we need to include both the auto-reversed AND the custom conditions
                          let allReversedConditions = [...reversedConditions];
                          
                          // If reversing sell conditions and sell has extra conditions, include them reversed too
                          if (side === 'buy' && entryConditions.sell && entryConditions.sell.length > 0) {
                            const extraReversedConditions = reverseEntryConditions(entryConditions.sell);
                            allReversedConditions = [...allReversedConditions, ...extraReversedConditions];
                          }
                          
                          // Store all reversed conditions
                          updateExitCondition(side, { 
                            ...condition, 
                            conditions: allReversedConditions,
                            extraConditions: condition.extraConditions || [] // Preserve existing custom conditions
                          });
                        }
                      } else {
                        // Keep custom conditions when disabling reverse
                        updateExitCondition(side, { 
                          ...condition, 
                          conditions: [],
                          extraConditions: condition.extraConditions || []
                        });
                      }
                    }}
                  />
                  <Label className="text-sm">Use reversed entry conditions</Label>
                </div>
              )}
            </div>
            
            {!reverseEntryForExit[condition.id] && (
              <EnhancedConditionsBuilder
                conditionGroups={[{ 
                  id: `exit_group_${condition.id}`, 
                  conditions: condition.conditions || [] 
                }]}
                indicators={indicators}
                onConditionsChange={(groups) => 
                  updateExitCondition(side, { 
                    ...condition, 
                    conditions: groups[0]?.conditions || [] 
                  })
                }
                title={`${side.toUpperCase()} Exit Conditions`}
                compact={true}
              />
            )}
            
            {reverseEntryForExit[condition.id] && entryConditions && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Auto-Generated from Entry Conditions</Label>
                    <Badge variant="outline" className="text-xs">Read Only</Badge>
                  </div>
                  <EnhancedConditionsBuilder
                    conditionGroups={(() => {
                      // For buy exit, reverse sell entry (or buy if no sell)
                      // For sell exit, reverse buy entry
                      let allSourceGroups = [];
                      
                      if (side === 'buy') {
                        // For buy exit: reverse sell entry conditions
                        if (entryConditions.sell && entryConditions.sell.length > 0) {
                          // If sell has conditions, reverse them
                          allSourceGroups = [...entryConditions.sell];
                        } else {
                          // If no sell conditions, reverse buy conditions
                          allSourceGroups = entryConditions.buy || [];
                        }
                        
                        // If sell entry was auto-reversed from buy, also include the original buy conditions reversed
                        if (entryConditions.reverseSellFromBuy && entryConditions.buy && entryConditions.buy.length > 0) {
                          // Add the original buy conditions (they will be double-reversed, so back to original logic)
                          allSourceGroups = [...allSourceGroups, ...entryConditions.buy];
                        }
                      } else {
                        // For sell exit: reverse buy entry conditions
                        allSourceGroups = entryConditions.buy || [];
                      }
                      
                      if (allSourceGroups.length === 0) return [];
                      
                      return allSourceGroups.map(group => ({
                        ...group,
                        id: `exit_reversed_${group.id}`,
                        conditions: group.conditions.map(cond => ({
                          ...cond,
                          id: `exit_reversed_${cond.id}`,
                          operator: reverseOperator(cond.operator)
                        }))
                      }));
                    })()}
                    indicators={indicators}
                    onConditionsChange={() => {}}
                    title=""
                    readonly={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Additional Custom Exit Conditions</Label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <EnhancedConditionsBuilder
                      conditionGroups={condition.extraConditions && condition.extraConditions.length > 0 
                        ? [{ 
                            id: `extra_exit_group_${condition.id}`, 
                            conditions: condition.extraConditions,
                            logicalOperator: 'AND'
                          }]
                        : [{ 
                            id: `extra_exit_group_${condition.id}`, 
                            conditions: [],
                            logicalOperator: 'AND'
                          }]
                      }
                      indicators={indicators}
                      onConditionsChange={(groups) => {
                        const newExtraConditions = groups.length > 0 ? groups[0].conditions : [];
                        updateExitCondition(side, { 
                          ...condition, 
                          conditions: condition.conditions || [], // Preserve reversed conditions
                          extraConditions: newExtraConditions
                        });
                      }}
                      title="Add Custom Conditions"
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Exit Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Configure stop loss, targets, and exit conditions with priority ordering
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(strategyDirection === 'buy' || strategyDirection === 'both') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Buy Exit Conditions</h4>
              <Select onValueChange={(type: 'SL' | 'TGT' | 'SAR' | 'CONDITION') => addExitCondition('buy', type)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add exit condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SL">Stop Loss</SelectItem>
                  <SelectItem value="TGT">Target</SelectItem>
                  <SelectItem value="SAR">Parabolic SAR</SelectItem>
                  <SelectItem value="CONDITION">Custom Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {exitConditions.buy.map((condition, index) => 
                renderExitCondition(condition, 'buy', index)
              )}
              
              {exitConditions.buy.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No buy exit conditions configured</p>
                  <p className="text-xs">Add conditions using the dropdown above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(strategyDirection === 'sell' || strategyDirection === 'both') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Sell Exit Conditions</h4>
              <Select onValueChange={(type: 'SL' | 'TGT' | 'SAR' | 'CONDITION') => addExitCondition('sell', type)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add exit condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SL">Stop Loss</SelectItem>
                  <SelectItem value="TGT">Target</SelectItem>
                  <SelectItem value="SAR">Parabolic SAR</SelectItem>
                  <SelectItem value="CONDITION">Custom Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {exitConditions.sell.map((condition, index) => 
                renderExitCondition(condition, 'sell', index)
              )}
              
              {exitConditions.sell.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No sell exit conditions configured</p>
                  <p className="text-xs">Add conditions using the dropdown above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(exitConditions.buy.length > 1 || exitConditions.sell.length > 1) && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Priority System</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Lower priority numbers execute first when multiple conditions trigger</li>
            <li>• Use the up/down arrows to reorder priorities</li>
            <li>• SAR conditions compete with SL/TGT based on their priority setting</li>
          </ul>
        </div>
      )}
    </div>
  );
}