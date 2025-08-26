import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Move } from 'lucide-react';
import { ConditionGroup, Condition, IndicatorConfig, ConditionOperator, LogicalOperator } from '@/types/strategy';
import { getAllIndicatorDefinition } from '@/data/allIndicatorDefinitions';

interface EnhancedConditionsBuilderProps {
  conditionGroups: ConditionGroup[];
  indicators: IndicatorConfig[];
  onConditionsChange: (groups: ConditionGroup[]) => void;
  title: string;
  readonly?: boolean;
}

const operatorOptions: { value: ConditionOperator; label: string }[] = [
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'equal', label: 'Equal To (=)' },
  { value: 'crosses_above', label: 'Crosses Above' },
  { value: 'crosses_below', label: 'Crosses Below' },
  { value: 'between', label: 'Between' }
];

const logicalOperatorOptions: { value: LogicalOperator; label: string }[] = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' }
];

const priceOptions = [
  { value: 'open', label: 'Open Price' },
  { value: 'high', label: 'High Price' },
  { value: 'low', label: 'Low Price' },
  { value: 'close', label: 'Close Price' },
  { value: 'volume', label: 'Volume' }
];

export function EnhancedConditionsBuilder({
  conditionGroups,
  indicators,
  onConditionsChange,
  title,
  readonly = false
}: EnhancedConditionsBuilderProps) {
  
  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: `group_${Date.now()}`,
      conditions: [],
      logicalOperator: 'AND'
    };
    onConditionsChange([...conditionGroups, newGroup]);
  };

  const addConditionToGroup = (groupId: string) => {
    const newCondition: Condition = {
      id: `condition_${Date.now()}`,
      leftOperand: { type: 'price', value: 'close' },
      operator: 'greater_than',
      rightOperand: { type: 'value', value: 0 },
      logicalOperator: 'AND'
    };
    
    const updatedGroups = conditionGroups.map(group =>
      group.id === groupId 
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    );
    onConditionsChange(updatedGroups);
  };

  const updateConditionGroup = (groupId: string, updates: Partial<ConditionGroup>) => {
    const updatedGroups = conditionGroups.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    );
    onConditionsChange(updatedGroups);
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<Condition>) => {
    const updatedGroups = conditionGroups.map(group =>
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId ? { ...condition, ...updates } : condition
            )
          }
        : group
    );
    onConditionsChange(updatedGroups);
  };

  const deleteCondition = (groupId: string, conditionId: string) => {
    const updatedGroups = conditionGroups.map(group =>
      group.id === groupId 
        ? { ...group, conditions: group.conditions.filter(condition => condition.id !== conditionId) }
        : group
    );
    onConditionsChange(updatedGroups);
  };

  const deleteConditionGroup = (groupId: string) => {
    onConditionsChange(conditionGroups.filter(group => group.id !== groupId));
  };

  const getIndicatorOptions = () => {
    const options: { value: string; label: string }[] = [];
    
    indicators.forEach(indicator => {
      const definition = getAllIndicatorDefinition(indicator.type);
      if (definition) {
        definition.outputs.forEach(output => {
          options.push({
            value: `${indicator.id}.${output.name}`,
            label: `${definition.name} - ${output.label}`
          });
        });
      }
    });
    
    return options;
  };

  const renderOperandSelect = (
    groupId: string,
    condition: Condition,
    operandType: 'leftOperand' | 'rightOperand'
  ) => {
    const operand = condition[operandType];
    const indicatorOptions = getIndicatorOptions();

    return (
      <div className="space-y-2">
        <Select
          value={operand.type}
          onValueChange={(type: 'indicator' | 'price' | 'value') => {
            const newOperand = { type, value: type === 'value' ? 0 : '' };
            updateCondition(groupId, condition.id, { [operandType]: newOperand });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indicator">Indicator</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="value">Value</SelectItem>
          </SelectContent>
        </Select>

        {operand.type === 'indicator' && (
          <Select
            value={operand.indicatorId ? `${operand.indicatorId}.${operand.value}` : ''}
            onValueChange={(value) => {
              const [indicatorId, outputName] = value.split('.');
              updateCondition(groupId, condition.id, {
                [operandType]: {
                  ...operand,
                  value: outputName,
                  indicatorId
                }
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select indicator output" />
            </SelectTrigger>
            <SelectContent>
              {indicatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {operand.type === 'price' && (
          <Select
            value={operand.value as string}
            onValueChange={(value) => {
              updateCondition(groupId, condition.id, {
                [operandType]: { ...operand, value }
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {operand.type === 'value' && (
          <Input
            type="number"
            value={operand.value as number}
            onChange={(e) => {
              updateCondition(groupId, condition.id, {
                [operandType]: { ...operand, value: Number(e.target.value) }
              });
            }}
            placeholder="Enter value"
            step="0.01"
          />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {!readonly && (
            <Button onClick={addConditionGroup} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Condition Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {conditionGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No condition groups defined yet</p>
            <p className="text-sm">Click "Add Condition Group" to create your first group</p>
          </div>
        ) : (
          conditionGroups.map((group, groupIndex) => (
            <div key={group.id}>
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium">
                        Group {groupIndex + 1}
                      </Label>
                      {groupIndex > 0 && (
                        <Select
                          value={group.logicalOperator || 'AND'}
                          onValueChange={(operator: LogicalOperator) => 
                            updateConditionGroup(group.id, { logicalOperator: operator })
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {logicalOperatorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!readonly && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addConditionToGroup(group.id)}
                            className="gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Add Condition
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteConditionGroup(group.id)}
                            className="text-destructive hover:text-destructive gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {group.conditions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No conditions in this group. Click "Add Condition" to start.
                    </div>
                  ) : (
                    group.conditions.map((condition, conditionIndex) => (
                      <div key={condition.id}>
                        <Card className="p-4 bg-muted/30">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Label className="text-xs font-medium">
                                  Condition {conditionIndex + 1}
                                </Label>
                                {conditionIndex > 0 && (
                                  <Select
                                    value={condition.logicalOperator || 'AND'}
                                    onValueChange={(operator: LogicalOperator) => 
                                      updateCondition(group.id, condition.id, { logicalOperator: operator })
                                    }
                                  >
                                    <SelectTrigger className="w-16 h-6 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {logicalOperatorOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCondition(group.id, condition.id)}
                                className="text-destructive hover:text-destructive h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <div className="space-y-2">
                                <Label className="text-xs">Left Operand</Label>
                                {renderOperandSelect(group.id, condition, 'leftOperand')}
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-xs">Operator</Label>
                                <Select
                                  value={condition.operator}
                                  onValueChange={(operator: ConditionOperator) => {
                                    updateCondition(group.id, condition.id, { operator });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operatorOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-xs">Right Operand</Label>
                                {renderOperandSelect(group.id, condition, 'rightOperand')}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              
              {groupIndex < conditionGroups.length - 1 && (
                <div className="text-center py-2">
                  <span className="bg-background px-3 py-1 border rounded text-sm text-muted-foreground">
                    {group.logicalOperator || 'AND'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}