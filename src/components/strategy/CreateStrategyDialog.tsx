import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Strategy, StrategyType, IndicatorConfig, Condition, IndicatorType } from '@/types/strategy';
import { indicatorDefinitions } from '@/data/indicatorDefinitions';
import { DynamicIndicatorConfig } from './DynamicIndicatorConfig';
import { DynamicConditionsBuilder } from './DynamicConditionsBuilder';

interface CreateStrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const strategyTypeOptions: { value: StrategyType; label: string }[] = [
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'custom', label: 'Custom' }
];

export function CreateStrategyDialog({ open, onOpenChange, onCreateStrategy }: CreateStrategyDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as StrategyType
  });
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
  const [entryConditions, setEntryConditions] = useState<Condition[]>([]);
  const [exitConditions, setExitConditions] = useState<Condition[]>([]);

  const resetForm = () => {
    setStep(1);
    setFormData({ name: '', description: '', type: 'custom' });
    setIndicators([]);
    setEntryConditions([]);
    setExitConditions([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const addIndicator = (type: IndicatorType) => {
    const definition = indicatorDefinitions.find(def => def.type === type);
    if (!definition) return;

    const defaultParameters: Record<string, string | number | boolean> = {};
    definition.parameters.forEach(param => {
      defaultParameters[param.name] = param.defaultValue;
    });

    const newIndicator: IndicatorConfig = {
      id: `indicator_${Date.now()}`,
      type,
      parameters: defaultParameters
    };

    setIndicators([...indicators, newIndicator]);
  };

  const updateIndicator = (updatedIndicator: IndicatorConfig) => {
    setIndicators(indicators.map(ind => 
      ind.id === updatedIndicator.id ? updatedIndicator : ind
    ));
  };

  const deleteIndicator = (id: string) => {
    setIndicators(indicators.filter(ind => ind.id !== id));
    // Also remove any conditions that reference this indicator
    const filterConditions = (conditions: Condition[]) =>
      conditions.filter(condition => 
        condition.leftOperand.indicatorId !== id && condition.rightOperand.indicatorId !== id
      );
    
    setEntryConditions(filterConditions(entryConditions));
    setExitConditions(filterConditions(exitConditions));
  };

  const handleCreate = () => {
    const strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      indicators,
      entryConditions,
      exitConditions,
      isCustom: true,
      createdBy: 'current_user' // This would come from auth context
    };

    onCreateStrategy(strategy);
    handleClose();
  };

  const canProceedFromStep1 = formData.name.trim() && formData.description.trim();
  const canProceedFromStep2 = indicators.length > 0;
  const canCreate = entryConditions.length > 0 || exitConditions.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Custom Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    stepNumber < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Strategy Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter strategy name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your strategy"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Strategy Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: StrategyType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {strategyTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Add Indicators */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add Indicators</h3>
                <div className="flex gap-2">
                  {indicatorDefinitions.map((definition) => (
                    <Button
                      key={definition.type}
                      variant="outline"
                      size="sm"
                      onClick={() => addIndicator(definition.type)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {definition.type}
                    </Button>
                  ))}
                </div>
              </div>

              {indicators.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No indicators added yet</p>
                    <p className="text-sm text-muted-foreground">Click on an indicator button above to add it</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {indicators.map((indicator) => (
                    <DynamicIndicatorConfig
                      key={indicator.id}
                      indicator={indicator}
                      onUpdate={updateIndicator}
                      onDelete={deleteIndicator}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Entry Conditions */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Entry Conditions</h3>
              <DynamicConditionsBuilder
                conditions={entryConditions}
                indicators={indicators}
                onConditionsChange={setEntryConditions}
                title="Entry Conditions"
              />
            </div>
          )}

          {/* Step 4: Exit Conditions */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Exit Conditions</h3>
              <DynamicConditionsBuilder
                conditions={exitConditions}
                indicators={indicators}
                onConditionsChange={setExitConditions}
                title="Exit Conditions"
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={step === 1 ? handleClose : handlePrevious}
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedFromStep1) ||
                  (step === 2 && !canProceedFromStep2)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!canCreate}
              >
                Create Strategy
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}