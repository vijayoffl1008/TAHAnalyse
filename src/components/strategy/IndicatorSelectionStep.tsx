import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X } from 'lucide-react';
import { IndicatorConfig, IndicatorType } from '@/types/strategy';
import { DynamicIndicatorConfig } from './DynamicIndicatorConfig';
import { getIndicatorsByCategory, getAllIndicatorDefinition } from '@/data/allIndicatorDefinitions';

interface IndicatorSelectionStepProps {
  indicators: IndicatorConfig[];
  onIndicatorsChange: (indicators: IndicatorConfig[]) => void;
}

export function IndicatorSelectionStep({ indicators, onIndicatorsChange }: IndicatorSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddIndicator, setShowAddIndicator] = useState(false);

  const indicatorsByCategory = getIndicatorsByCategory();
  const categories = ['all', ...Object.keys(indicatorsByCategory)];
  const availableIndicators = selectedCategory === 'all' 
    ? Object.values(indicatorsByCategory).flat()
    : indicatorsByCategory[selectedCategory] || [];
  
  const filteredIndicators = availableIndicators.filter(indicator =>
    indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIndicator = (indicatorType: IndicatorType) => {
    const newIndicator: IndicatorConfig = {
      id: `indicator_${Date.now()}`,
      type: indicatorType,
      parameters: {}
    };
    onIndicatorsChange([...indicators, newIndicator]);
    setShowAddIndicator(false);
  };

  const updateIndicator = (updatedIndicator: IndicatorConfig) => {
    const updatedIndicators = indicators.map(indicator =>
      indicator.id === updatedIndicator.id ? updatedIndicator : indicator
    );
    onIndicatorsChange(updatedIndicators);
  };

  const removeIndicator = (id: string) => {
    onIndicatorsChange(indicators.filter(indicator => indicator.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Selected Indicators ({indicators.length})</CardTitle>
          <Button onClick={() => setShowAddIndicator(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Indicator
          </Button>
        </CardHeader>
        <CardContent>
          {indicators.length > 0 ? (
            <div className="space-y-4">
              {indicators.map((indicator) => (
                <DynamicIndicatorConfig
                  key={indicator.id}
                  indicator={indicator}
                  onUpdate={updateIndicator}
                  onDelete={removeIndicator}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No indicators selected yet. Click "Add Indicator" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddIndicator && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Indicator</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddIndicator(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="indicator-search">Search Indicators</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="indicator-search"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredIndicators.map((indicator) => (
                <Card key={indicator.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{indicator.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {indicator.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{indicator.description}</p>
                    <Button
                      size="sm"
                      onClick={() => addIndicator(indicator.type)}
                      className="w-full"
                      disabled={indicators.some(ind => ind.type === indicator.type)}
                    >
                      {indicators.some(ind => ind.type === indicator.type) ? 'Already Added' : 'Add Indicator'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIndicators.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No indicators found matching your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}