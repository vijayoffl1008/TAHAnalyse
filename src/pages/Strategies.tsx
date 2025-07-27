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
  Activity
} from "lucide-react";

export default function Strategies() {
  // Mock predefined strategies
  const predefinedStrategies = [
    {
      id: 1,
      name: "Moving Average Crossover",
      description: "Classic trend-following strategy using two moving averages",
      category: "Trend Following",
      difficulty: "Beginner",
      winRate: 68.5,
      isLocked: false
    },
    {
      id: 2,
      name: "RSI Oversold/Overbought",
      description: "Mean reversion strategy based on RSI levels",
      category: "Mean Reversion",
      difficulty: "Intermediate",
      winRate: 72.3,
      isLocked: false
    },
    {
      id: 3,
      name: "Bollinger Bands Squeeze",
      description: "Volatility breakout strategy using Bollinger Bands",
      category: "Volatility",
      difficulty: "Advanced",
      winRate: 65.8,
      isLocked: true
    },
    {
      id: 4,
      name: "MACD Divergence",
      description: "Momentum strategy based on MACD divergence patterns",
      category: "Momentum",
      difficulty: "Advanced",
      winRate: 74.2,
      isLocked: true
    }
  ];

  // Mock user-defined strategies
  const userStrategies = [
    {
      id: 5,
      name: "Custom Scalping Strategy",
      description: "My personalized scalping approach for 5-minute charts",
      category: "Scalping",
      lastModified: "2024-01-20",
      tests: 12,
      avgReturn: 2.4
    },
    {
      id: 6,
      name: "Support & Resistance Breakout",
      description: "Custom strategy targeting key S&R level breakouts",
      category: "Breakout",
      lastModified: "2024-01-18",
      tests: 8,
      avgReturn: 3.1
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'default';
      case 'Intermediate': return 'outline';
      case 'Advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Strategy Library</h1>
          <p className="text-muted-foreground">Browse predefined strategies or create your own</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Strategy
        </Button>
      </div>

      {/* Predefined Strategies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Predefined Strategies</h2>
          <Badge variant="secondary" className="ml-2">{predefinedStrategies.length} Available</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predefinedStrategies.map((strategy) => (
            <Card key={strategy.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {strategy.name}
                      {strategy.isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Unlock className="w-4 h-4 text-success" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{strategy.category}</Badge>
                  <Badge variant={getDifficultyColor(strategy.difficulty)}>
                    {strategy.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-success">{strategy.winRate}%</div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2" 
                      disabled={strategy.isLocked}
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </Button>
                  </div>
                </div>

                {strategy.isLocked && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Pro to unlock this strategy
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User-Defined Strategies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-semibold">Your Custom Strategies</h2>
          <Badge variant="secondary" className="ml-2">{userStrategies.length} Created</Badge>
        </div>

        {userStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStrategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{strategy.category}</Badge>
                    <p className="text-xs text-muted-foreground">
                      Modified: {strategy.lastModified}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{strategy.tests}</div>
                      <p className="text-xs text-muted-foreground">Tests Run</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-success">+{strategy.avgReturn}%</div>
                      <p className="text-xs text-muted-foreground">Avg Return</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <Settings className="w-4 h-4" />
                      Edit
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
              <p className="text-muted-foreground mb-4">Create your first custom strategy to get started</p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Strategy
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}