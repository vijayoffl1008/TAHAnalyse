import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Strategy, StrategyType, IndicatorConfig, ConditionGroup, ExitCondition, ReentrySettings, SpecialScenario } from '@/types/strategy';
import { StrategyConfigStep } from './StrategyConfigStep';
import { IndicatorSelectionStep } from './IndicatorSelectionStep';
import { EnhancedConditionsBuilder } from './EnhancedConditionsBuilder';
import { ExitConditionsBuilder } from './ExitConditionsBuilder';
import { ReentrySettingsBuilder } from './ReentrySettingsBuilder';
import { SpecialScenariosBuilder } from './SpecialScenariosBuilder';
import { StrategySummary } from './StrategySummary';

interface EnhancedCreateStrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function EnhancedCreateStrategyDialog({ open, onOpenChange, onCreateStrategy }: EnhancedCreateStrategyDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyConfig, setStrategyConfig] = useState({
    name: '',
    description: '',
    type: 'trend_following' as StrategyType,
    duration: 'intraday' as 'intraday' | 'positional',
    direction: 'both' as 'buy' | 'sell' | 'both'
  });
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
  const [entryConditions, setEntryConditions] = useState<{
    buy: ConditionGroup[];
    sell: ConditionGroup[];
    reverseSellFromBuy: boolean;
  }>({
    buy: [],
    sell: [],
    reverseSellFromBuy: false
  });
  const [exitConditions, setExitConditions] = useState<{
    buy: ExitCondition[];
    sell: ExitCondition[];
  }>({
    buy: [],
    sell: []
  });
  const [reentrySettings, setReentrySettings] = useState<ReentrySettings>({
    type: 'none',
    maxReentries: 1,
    conditions: []
  });
  const [specialScenarios, setSpecialScenarios] = useState<SpecialScenario[]>([]);

  const steps = [
    { number: 1, title: 'Strategy Configuration', description: 'Basic settings and type' },
    { number: 2, title: 'Indicators Selection', description: 'Choose indicators' },
    { number: 3, title: 'Entry Conditions', description: 'Buy/Sell conditions' },
    { number: 4, title: 'Exit Conditions', description: 'SL/TGT/SAR settings' },
    { number: 5, title: 'Re-entry Settings', description: 'Re-entry configuration' },
    { number: 6, title: 'Special Scenarios', description: 'Market conditions' },
    { number: 7, title: 'Summary', description: 'Review & Create' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateStrategy = () => {
    const strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> = {
      ...strategyConfig,
      indicators,
      entryConditions,
      exitConditions,
      reentrySettings,
      specialScenarios,
      isCustom: true
    };
    
    onCreateStrategy(strategy);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setStrategyConfig({
      name: '',
      description: '',
      type: 'trend_following',
      duration: 'intraday',
      direction: 'both'
    });
    setIndicators([]);
    setEntryConditions({
      buy: [],
      sell: [],
      reverseSellFromBuy: false
    });
    setExitConditions({
      buy: [],
      sell: []
    });
    setReentrySettings({
      type: 'none',
      maxReentries: 1,
      conditions: []
    });
    setSpecialScenarios([]);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return strategyConfig.name.length > 0 && strategyConfig.description.length > 0;
      case 2:
        return indicators.length > 0;
      case 3:
        return entryConditions.buy.length > 0 || (strategyConfig.direction === 'sell' && entryConditions.sell.length > 0);
      case 4:
        return exitConditions.buy.length > 0 || exitConditions.sell.length > 0;
      case 5:
        return true; // Re-entry is optional
      case 6:
        return true; // Special scenarios are optional
      case 7:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StrategyConfigStep
            config={strategyConfig}
            onConfigChange={setStrategyConfig}
          />
        );
      case 2:
        return (
          <IndicatorSelectionStep
            indicators={indicators}
            onIndicatorsChange={setIndicators}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Entry Conditions</h3>
              <p className="text-sm text-muted-foreground">Define when to enter buy and sell positions</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedConditionsBuilder
                conditionGroups={entryConditions.buy}
                indicators={indicators}
                onConditionsChange={(groups) => setEntryConditions(prev => ({ ...prev, buy: groups }))}
                title="Buy Entry Conditions"
              />
              
              <EnhancedConditionsBuilder
                conditionGroups={entryConditions.sell}
                indicators={indicators}
                onConditionsChange={(groups) => setEntryConditions(prev => ({ ...prev, sell: groups }))}
                title="Sell Entry Conditions"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <ExitConditionsBuilder
            exitConditions={[...exitConditions.buy, ...exitConditions.sell]}
            onExitConditionsChange={(conditions: ExitCondition[]) => {
              // Split conditions back into buy/sell based on strategy direction
              const buyConditions = conditions.filter((_, index) => index < conditions.length / 2);
              const sellConditions = conditions.filter((_, index) => index >= conditions.length / 2);
              setExitConditions({ buy: buyConditions, sell: sellConditions });
            }}
            indicators={indicators}
            title="Exit Conditions"
          />
        );
      case 5:
        return (
          <ReentrySettingsBuilder
            reentrySettings={reentrySettings}
            onReentrySettingsChange={setReentrySettings}
            strategyDuration={strategyConfig.duration}
            indicators={indicators}
          />
        );
      case 6:
        return (
          <SpecialScenariosBuilder
            specialScenarios={specialScenarios}
            onSpecialScenariosChange={setSpecialScenarios}
            strategyDuration={strategyConfig.duration}
            indicators={indicators}
          />
        );
      case 7:
        return (
          <StrategySummary
            formData={strategyConfig}
            indicators={indicators}
            entryConditions={entryConditions}
            exitConditions={exitConditions}
            reentrySettings={reentrySettings}
            specialScenarios={specialScenarios}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Enhanced Strategy Builder</DialogTitle>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                      ${currentStep === step.number 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep > step.number 
                          ? 'bg-success text-white' 
                          : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                    </div>
                    {step.number < steps.length && (
                      <div className={`w-8 h-0.5 mx-1 ${currentStep > step.number ? 'bg-success' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="text-xs">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {currentStep === steps.length ? (
              <Button onClick={handleCreateStrategy} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Create Strategy
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}