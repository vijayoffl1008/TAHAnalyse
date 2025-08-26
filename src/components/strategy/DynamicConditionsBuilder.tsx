import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Condition, IndicatorConfig, ConditionOperator } from '@/types/strategy';
import { getIndicatorDefinition } from '@/data/indicatorDefinitions';

interface DynamicConditionsBuilderProps {
  conditions: Condition[];
  indicators: IndicatorConfig[];
  onConditionsChange: (conditions: Condition[]) => void;
  title: string;
}

const operatorOptions: { value: ConditionOperator; label: string }[] = [
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'equal', label: 'Equal To (=)' },
  { value: 'crosses_above', label: 'Crosses Above' },
  { value: 'crosses_below', label: 'Crosses Below' },
  { value: 'between', label: 'Between' }
];

const priceOptions = [
  { value: 'open', label: 'Open Price' },
  { value: 'high', label: 'High Price' },
  { value: 'low', label: 'Low Price' },
  { value: 'close', label: 'Close Price' },
  { value: 'volume', label: 'Volume' }
];

export function DynamicConditionsBuilder({
  conditions,
  indicators,
  onConditionsChange,
  title
}: DynamicConditionsBuilderProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      id: `condition_${Date.now()}`,
      leftOperand: { type: 'price', value: 'close' },
      operator: 'greater_than',
      rightOperand: { type: 'value', value: 0 }
    };
    onConditionsChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    const updatedConditions = conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    onConditionsChange(updatedConditions);
  };

  const deleteCondition = (id: string) => {
    onConditionsChange(conditions.filter(condition => condition.id !== id));
  };

  const getIndicatorOptions = () => {
    const options: { value: string; label: string; outputs: string[] }[] = [];
    
    indicators.forEach(indicator => {
      const definition = getIndicatorDefinition(indicator.type);
      if (definition) {
        definition.outputs.forEach(output => {
          options.push({
            value: `${indicator.id}.${output.name}`,
            label: `${definition.name} - ${output.label}`,
            outputs: [output.name]
          });
        });
      }
    });
    
    return options;
  };

  const renderOperandSelect = (
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
            updateCondition(condition.id, { [operandType]: newOperand });
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
              updateCondition(condition.id, {
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
              updateCondition(condition.id, {
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
              updateCondition(condition.id, {
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
          <Button onClick={addCondition} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Condition
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No conditions defined yet</p>
            <p className="text-sm">Click "Add Condition" to create your first condition</p>
          </div>
        ) : (
          conditions.map((condition, index) => (
            <Card key={condition.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Condition {index + 1}
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCondition(condition.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-sm">Left Operand</Label>
                    {renderOperandSelect(condition, 'leftOperand')}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(operator: ConditionOperator) => {
                        updateCondition(condition.id, { operator });
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
                    <Label className="text-sm">Right Operand</Label>
                    {renderOperandSelect(condition, 'rightOperand')}
                  </div>
                </div>
                
                {index < conditions.length - 1 && (
                  <div className="text-center text-sm text-muted-foreground py-2 border-t">
                    AND
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}