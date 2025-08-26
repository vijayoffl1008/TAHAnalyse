import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Plus, 
  Settings, 
  Eye,
  Lock,
  Unlock,
  BarChart3,
  Activity,
  Edit,
  Trash2
} from "lucide-react";
import { Strategy } from "@/types/strategy";
import { EnhancedCreateStrategyDialog } from "@/components/strategy/EnhancedCreateStrategyDialog";
import { StrategyActions } from "@/components/strategy/StrategyActions";
import { ViewStrategyDialog } from "@/components/strategy/ViewStrategyDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function Strategies() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [viewingStrategy, setViewingStrategy] = useState<Strategy | null>(null);
  const [customStrategies, setCustomStrategies] = useState<Strategy[]>([]);

  // Mock predefined strategy (only one by default as requested)
  const predefinedStrategy = {
    id: 1,
    name: "Moving Average Crossover",
    description: "Classic trend-following strategy using two moving averages - 20 EMA crosses above 50 EMA for long entry",
    category: "Trend Following",
    difficulty: "Beginner",
    winRate: 68.5,
    isLocked: false,
    indicators: ["20 EMA", "50 EMA"],
    entryConditions: ["20 EMA > 50 EMA", "Price > 20 EMA"],
    exitConditions: ["20 EMA < 50 EMA", "Stop Loss: 2%"]
  };

  const handleCreateStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStrategy: Strategy = {
      ...strategyData,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCustomStrategies([...customStrategies, newStrategy]);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setShowCreateDialog(true);
  };

  const handleUpdateStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStrategy) {
      const updatedStrategy: Strategy = {
        ...strategyData,
        id: editingStrategy.id,
        createdAt: editingStrategy.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      setCustomStrategies(prev => prev.map(s => s.id === editingStrategy.id ? updatedStrategy : s));
      setShowCreateDialog(false);
      setEditingStrategy(null);
    }
  };

  const handleDeleteStrategy = (id: string) => {
    setCustomStrategies(customStrategies.filter(strategy => strategy.id !== id));
  };

  const handleViewStrategy = (strategy: Strategy) => {
    setViewingStrategy(strategy);
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setEditingStrategy(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'default';
      case 'Intermediate': return 'outline';
      case 'Advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'trend_following': return 'bg-blue-100 text-blue-800';
      case 'mean_reversion': return 'bg-green-100 text-green-800';
      case 'momentum': return 'bg-purple-100 text-purple-800';
      case 'breakout': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Strategy Library</h1>
          <p className="text-muted-foreground">Browse the predefined strategy or create your own custom strategies</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          Create Strategy
        </Button>
      </div>

      {/* Predefined Strategy Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Predefined Strategy</h2>
          <Badge variant="secondary" className="ml-2">1 Available</Badge>
        </div>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {predefinedStrategy.name}
                  <Unlock className="w-4 h-4 text-success" />
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{predefinedStrategy.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">{predefinedStrategy.category}</Badge>
              <Badge variant={getDifficultyColor(predefinedStrategy.difficulty)}>
                {predefinedStrategy.difficulty}
              </Badge>
            </div>

            {/* Indicators Used */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Indicators:</h4>
              <div className="flex flex-wrap gap-2">
                {predefinedStrategy.indicators.map((indicator, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Entry Conditions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Entry Conditions:</h4>
              <div className="space-y-1">
                {predefinedStrategy.entryConditions.map((condition, index) => (
                  <p key={index} className="text-xs text-muted-foreground">• {condition}</p>
                ))}
              </div>
            </div>

            {/* Exit Conditions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Exit Conditions:</h4>
              <div className="space-y-1">
                {predefinedStrategy.exitConditions.map((condition, index) => (
                  <p key={index} className="text-xs text-muted-foreground">• {condition}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-success">{predefinedStrategy.winRate}%</div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Use Strategy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Strategies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-semibold">Your Custom Strategies</h2>
          <Badge variant="secondary" className="ml-2">{customStrategies.length} Created</Badge>
        </div>

        {customStrategies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {customStrategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {strategy.name}
                        <Badge className={getStrategyTypeColor(strategy.type)} variant="secondary">
                          {strategy.type.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditStrategy(strategy)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Indicators */}
                  {strategy.indicators.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Indicators ({strategy.indicators.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.indicators.slice(0, 3).map((indicator) => (
                          <Badge key={indicator.id} variant="secondary" className="text-xs">
                            {indicator.type}
                          </Badge>
                        ))}
                        {strategy.indicators.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{strategy.indicators.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conditions Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">
                        {Array.isArray(strategy.entryConditions) ? strategy.entryConditions.length : 
                         (strategy.entryConditions?.buy?.length || 0) + (strategy.entryConditions?.sell?.length || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Entry Conditions</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">
                        {Array.isArray(strategy.exitConditions) ? strategy.exitConditions.length : 
                         (strategy.exitConditions?.buy?.length || 0) + (strategy.exitConditions?.sell?.length || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Exit Conditions</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewStrategy(strategy)}
                      className="gap-2 flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <Settings className="w-4 h-4" />
                      Test Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No custom strategies yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custom strategy with dynamic indicators and conditions
              </p>
              <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4" />
                Create Your First Strategy
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Strategy Dialog */}
      <EnhancedCreateStrategyDialog
        open={showCreateDialog}
        onOpenChange={handleCloseCreateDialog}
        onCreateStrategy={editingStrategy ? handleUpdateStrategy : handleCreateStrategy}
        editingStrategy={editingStrategy}
      />

      {/* View Strategy Dialog */}
      <ViewStrategyDialog
        open={viewingStrategy !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingStrategy(null);
          }
        }}
        strategy={viewingStrategy}
      />
    </div>
  );
}