import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Calculator, Layers } from 'lucide-react';

interface IndicatorDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
}

interface CreateCustomIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateIndicator: (indicator: any) => void;
  predefinedIndicators: IndicatorDefinition[];
}

export function CreateCustomIndicatorDialog({
  open,
  onOpenChange,
  onCreateIndicator,
  predefinedIndicators
}: CreateCustomIndicatorDialogProps) {
  const [indicatorType, setIndicatorType] = useState<'combination' | 'calculation'>('combination');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [formula, setFormula] = useState('');
  const [parameters, setParameters] = useState<Record<string, any>>({});

  const categories = ['trend', 'momentum', 'volatility', 'volume', 'oscillator'];

  const resetForm = () => {
    setIndicatorType('combination');
    setName('');
    setDescription('');
    setCategory('');
    setSelectedIndicators([]);
    setFormula('');
    setParameters({});
  };

  const handleCreate = () => {
    const newIndicator = {
      name,
      description,
      type: indicatorType,
      category,
      parameters,
      ...(indicatorType === 'combination' && { baseIndicators: selectedIndicators }),
      ...(indicatorType === 'calculation' && { formula })
    };

    onCreateIndicator(newIndicator);
    resetForm();
  };

  const addIndicator = (indicatorType: string) => {
    if (!selectedIndicators.includes(indicatorType)) {
      setSelectedIndicators([...selectedIndicators, indicatorType]);
    }
  };

  const removeIndicator = (indicatorType: string) => {
    setSelectedIndicators(selectedIndicators.filter(type => type !== indicatorType));
  };

  const addParameter = (key: string, value: any) => {
    setParameters({ ...parameters, [key]: value });
  };

  const removeParameter = (key: string) => {
    const newParams = { ...parameters };
    delete newParams[key];
    setParameters(newParams);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Custom Indicator</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Indicator Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., RSI-MACD Combo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this indicator does and how it works..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Indicator Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Indicator Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={indicatorType} onValueChange={(value: any) => setIndicatorType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="combination" className="gap-2">
                    <Layers className="w-4 h-4" />
                    Combination
                  </TabsTrigger>
                  <TabsTrigger value="calculation" className="gap-2">
                    <Calculator className="w-4 h-4" />
                    Custom Calculation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="combination" className="mt-6 space-y-4">
                  <div>
                    <Label className="text-base font-medium">Base Indicators</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select 2 or more indicators to combine
                    </p>
                    
                    {/* Selected Indicators */}
                    {selectedIndicators.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm">Selected Indicators:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedIndicators.map(type => {
                            const indicator = predefinedIndicators.find(ind => ind.type === type);
                            return (
                              <Badge key={type} variant="secondary" className="gap-2">
                                {indicator?.name || type}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 hover:bg-transparent"
                                  onClick={() => removeIndicator(type)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Available Indicators Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                      {predefinedIndicators.map(indicator => (
                        <Button
                          key={indicator.type}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto p-2"
                          onClick={() => addIndicator(indicator.type)}
                          disabled={selectedIndicators.includes(indicator.type)}
                        >
                          <div>
                            <div className="font-medium text-xs">{indicator.name}</div>
                            <div className="text-xs text-muted-foreground">{indicator.category}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Combination Logic */}
                  <div className="space-y-2">
                    <Label>Combination Logic</Label>
                    <Select onValueChange={(value) => addParameter('combinationLogic', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How should the indicators be combined?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="average">Average of all indicators</SelectItem>
                        <SelectItem value="weighted">Weighted average</SelectItem>
                        <SelectItem value="crossover">Crossover signals</SelectItem>
                        <SelectItem value="confluence">Confluence zones</SelectItem>
                        <SelectItem value="custom">Custom formula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="calculation" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="formula">Custom Formula</Label>
                    <Textarea
                      id="formula"
                      placeholder="e.g., (HIGH + LOW + CLOSE) / 3 or SMA(CLOSE, 20) + 2 * STDDEV(CLOSE, 20)"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: OPEN, HIGH, LOW, CLOSE, VOLUME, SMA(), EMA(), RSI(), MACD(), etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Calculation Type</Label>
                    <Select onValueChange={(value) => addParameter('calculationType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price-based</SelectItem>
                        <SelectItem value="volume">Volume-based</SelectItem>
                        <SelectItem value="statistical">Statistical</SelectItem>
                        <SelectItem value="mathematical">Mathematical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parameter Name</Label>
                  <Input 
                    placeholder="e.g., period, multiplier, threshold"
                    id="paramName"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., 14, 2.0, 0.7"
                      id="paramValue"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const nameEl = document.getElementById('paramName') as HTMLInputElement;
                        const valueEl = document.getElementById('paramValue') as HTMLInputElement;
                        if (nameEl?.value && valueEl?.value) {
                          addParameter(nameEl.value, parseFloat(valueEl.value) || valueEl.value);
                          nameEl.value = '';
                          valueEl.value = '';
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Parameters */}
              {Object.keys(parameters).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Current Parameters:</Label>
                  <div className="space-y-2">
                    {Object.entries(parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">
                          <strong>{key}:</strong> {String(value)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(key)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!name || !category || !description || 
              (indicatorType === 'combination' && selectedIndicators.length < 2) ||
              (indicatorType === 'calculation' && !formula)
            }
          >
            Create Indicator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}