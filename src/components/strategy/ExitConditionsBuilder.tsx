import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { ExitCondition, IndicatorConfig, ExitType, Condition } from '@/types/strategy';
import { EnhancedConditionsBuilder } from './EnhancedConditionsBuilder';

interface ExitConditionsBuilderProps {
  exitConditions: ExitCondition[];
  indicators: IndicatorConfig[];
  onExitConditionsChange: (conditions: ExitCondition[]) => void;
  title: string;
}

const exitTypeOptions: { value: ExitType; label: string; description: string }[] = [
  { value: 'SL', label: 'Stop Loss', description: 'Fixed stop loss level' },
  { value: 'TGT', label: 'Target', description: 'Profit target level' },
  { value: 'SAR', label: 'Stop and Reverse', description: 'Stop and reverse position' },
  { value: 'CONDITION', label: 'Condition Based', description: 'Custom exit conditions' }
];

export function ExitConditionsBuilder({
  exitConditions,
  indicators,
  onExitConditionsChange,
  title
}: ExitConditionsBuilderProps) {

  const addExitCondition = (type: ExitType) => {
    const newCondition: ExitCondition = {
      id: `exit_${Date.now()}`,
      type,
      ...(type === 'SL' && { value: 0, percentage: 2 }),
      ...(type === 'TGT' && { value: 0, percentage: 5 }),
      ...(type === 'SAR' && { 
        sarSettings: { useOnlySL: false, priority: 'first' } 
      }),
      ...(type === 'CONDITION' && { conditions: [] })
    };
    
    onExitConditionsChange([...exitConditions, newCondition]);
  };

  const updateExitCondition = (id: string, updates: Partial<ExitCondition>) => {
    const updatedConditions = exitConditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    onExitConditionsChange(updatedConditions);
  };

  const deleteExitCondition = (id: string) => {
    onExitConditionsChange(exitConditions.filter(condition => condition.id !== id));
  };

  const renderExitConditionConfig = (condition: ExitCondition) => {
    switch (condition.type) {
      case 'SL':
      case 'TGT':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Percentage (%)</Label>
                <Input
                  type="number"
                  value={condition.percentage || 0}
                  onChange={(e) => updateExitCondition(condition.id, { 
                    percentage: Number(e.target.value) 
                  })}
                  placeholder="Enter percentage"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Fixed Value (Optional)</Label>
                <Input
                  type="number"
                  value={condition.value || ''}
                  onChange={(e) => updateExitCondition(condition.id, { 
                    value: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  placeholder="Enter fixed value"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        );

      case 'SAR':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`sar-only-sl-${condition.id}`}
                checked={condition.sarSettings?.useOnlySL || false}
                onCheckedChange={(checked) => updateExitCondition(condition.id, {
                  sarSettings: { 
                    ...condition.sarSettings,
                    useOnlySL: !!checked 
                  }
                })}
              />
              <Label htmlFor={`sar-only-sl-${condition.id}`} className="text-sm">
                Use only as Stop Loss (not reverse)
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Priority when multiple conditions trigger</Label>
              <Select
                value={condition.sarSettings?.priority || 'first'}
                onValueChange={(priority: 'first' | 'last') => 
                  updateExitCondition(condition.id, {
                    sarSettings: { 
                      ...condition.sarSettings,
                      priority 
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">Execute whichever occurs first</SelectItem>
                  <SelectItem value="last">Execute whichever occurs last</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'CONDITION':
        return (
          <div className="space-y-4">
            <EnhancedConditionsBuilder
              conditionGroups={condition.conditions ? [{
                id: `group_${condition.id}`,
                conditions: condition.conditions,
                logicalOperator: 'AND'
              }] : []}
              indicators={indicators}
              onConditionsChange={(groups) => {
                const conditions = groups.length > 0 ? groups[0].conditions : [];
                updateExitCondition(condition.id, { conditions });
              }}
              title="Exit Conditions"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            {exitTypeOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => addExitCondition(option.value)}
                className="gap-2"
                disabled={exitConditions.some(c => c.type === option.value)}
              >
                <Plus className="w-4 h-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {exitConditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exit conditions defined yet</p>
            <p className="text-sm">Click on an exit type button above to add conditions</p>
          </div>
        ) : (
          exitConditions.map((condition) => {
            const typeOption = exitTypeOptions.find(opt => opt.value === condition.type);
            return (
              <Card key={condition.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {typeOption?.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {typeOption?.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExitCondition(condition.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {renderExitConditionConfig(condition)}
                </div>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}