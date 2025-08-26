import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, TrendingUp, Calculator, Layers, Eye } from 'lucide-react';
import { allIndicatorDefinitions } from '@/data/allIndicatorDefinitions';
import { CreateCustomIndicatorDialog } from '@/components/indicators/CreateCustomIndicatorDialog';
import { ViewIndicatorDialog } from '@/components/indicators/ViewIndicatorDialog';

interface CustomIndicator {
  id: string;
  name: string;
  description: string;
  type: 'combination' | 'calculation';
  category: string;
  parameters: Record<string, any>;
  formula?: string;
  baseIndicators?: string[];
  createdAt: string;
  updatedAt: string;
}

export function Indicators() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customIndicators, setCustomIndicators] = useState<CustomIndicator[]>([
    {
      id: 'custom_1',
      name: 'RSI-MACD Combo',
      description: 'Combination of RSI and MACD for enhanced trend analysis',
      type: 'combination',
      category: 'momentum',
      parameters: { rsi_period: 14, macd_fast: 12, macd_slow: 26 },
      baseIndicators: ['RSI', 'MACD'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

  const predefinedIndicators = allIndicatorDefinitions;
  
  const categories = [
    { id: 'all', name: 'All', icon: Layers },
    { id: 'trend', name: 'Trend', icon: TrendingUp },
    { id: 'momentum', name: 'Momentum', icon: TrendingUp },
    { id: 'volatility', name: 'Volatility', icon: TrendingUp },
    { id: 'volume', name: 'Volume', icon: TrendingUp },
    { id: 'custom', name: 'Custom', icon: Calculator }
  ];

  const filteredPredefined = predefinedIndicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'custom' ? false : 
                           indicator.category === selectedCategory;
    return matchesSearch && (selectedCategory === 'all' || matchesCategory);
  });

  const filteredCustom = customIndicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'custom' || 
                           indicator.category === selectedCategory;
    return matchesSearch && (selectedCategory === 'all' || selectedCategory === 'custom' || matchesCategory);
  });

  const handleCreateCustomIndicator = (indicator: Omit<CustomIndicator, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIndicator: CustomIndicator = {
      ...indicator,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCustomIndicators(prev => [...prev, newIndicator]);
    setCreateDialogOpen(false);
  };

  const handleDeleteCustomIndicator = (id: string) => {
    setCustomIndicators(prev => prev.filter(ind => ind.id !== id));
  };

  const handleViewIndicator = (indicator: any, isCustom = false) => {
    setSelectedIndicator({ ...indicator, isCustom });
    setViewDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Technical Indicators</h1>
          <p className="text-muted-foreground">
            Manage predefined and custom technical indicators for your strategies
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Indicator
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Indicators</TabsTrigger>
          <TabsTrigger value="predefined">Predefined ({predefinedIndicators.length})</TabsTrigger>
          <TabsTrigger value="custom">Custom ({customIndicators.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Custom Indicators Section */}
          {(selectedCategory === 'all' || selectedCategory === 'custom') && filteredCustom.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Custom Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustom.map((indicator) => (
                  <Card key={indicator.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-primary" />
                            {indicator.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {indicator.type === 'combination' ? 'Combination' : 'Calculation'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewIndicator(indicator, true)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Edit functionality */}}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomIndicator(indicator.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {indicator.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {indicator.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {indicator.createdAt}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Indicators Section */}
          {(selectedCategory !== 'custom') && filteredPredefined.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Predefined Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPredefined.map((indicator) => (
                  <Card key={indicator.type} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{indicator.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {indicator.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewIndicator(indicator, false)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {indicator.description}
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Parameters: {Object.keys(indicator.parameters || {}).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Type: {indicator.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predefined" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPredefined.map((indicator) => (
              <Card key={indicator.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{indicator.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {indicator.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewIndicator(indicator, false)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {indicator.description}
                  </p>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Parameters: {Object.keys(indicator.parameters || {}).length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Type: {indicator.type}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustom.map((indicator) => (
              <Card key={indicator.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        {indicator.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {indicator.type === 'combination' ? 'Combination' : 'Calculation'}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewIndicator(indicator, true)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Edit functionality */}}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomIndicator(indicator.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {indicator.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Category:</span>
                      <Badge variant="outline" className="text-xs">
                        {indicator.category}
                      </Badge>
                    </div>
                    {indicator.baseIndicators && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Base: </span>
                        {indicator.baseIndicators.join(', ')}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created: {indicator.createdAt}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustom.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Indicators</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custom indicator to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Custom Indicator
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Custom Indicator Dialog */}
      <CreateCustomIndicatorDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateIndicator={handleCreateCustomIndicator}
        predefinedIndicators={predefinedIndicators}
      />

      {/* View Indicator Dialog */}
      <ViewIndicatorDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        indicator={selectedIndicator}
      />
    </div>
  );
}