import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  TrendingUp, 
  RefreshCw, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";

export default function Dashboard() {
  // Mock data
  const stats = {
    totalTests: 247,
    todayTests: 12,
    recurringTests: 5,
    successRate: 68.2
  };

  const recentTests = [
    { id: 1, name: "Moving Average Cross", strategy: "MA Cross", status: "completed", profit: 2.4, date: "2024-01-20" },
    { id: 2, name: "RSI Oversold", strategy: "RSI Strategy", status: "running", profit: -0.8, date: "2024-01-20" },
    { id: 3, name: "Bollinger Bands", strategy: "BB Strategy", status: "completed", profit: 1.2, date: "2024-01-19" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your trading performance overview.</p>
        </div>
        <Button className="gap-2">
          <Target className="w-4 h-4" />
          New Test
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tests</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTests}</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Tests</CardTitle>
            <RefreshCw className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recurringTests}</div>
            <p className="text-xs text-muted-foreground">Active schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Latest Test Runs</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.strategy}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${test.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                      {test.profit > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span className="font-medium">{test.profit > 0 ? '+' : ''}{test.profit}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.date}</p>
                  </div>
                  
                  <Badge 
                    variant={test.status === 'completed' ? 'secondary' : 'default'}
                    className="capitalize"
                  >
                    {test.status === 'running' && <Clock className="w-3 h-3 mr-1" />}
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}