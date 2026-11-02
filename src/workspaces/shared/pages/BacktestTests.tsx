import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Tests() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock test data
  const tests = [
    { 
      id: 1, 
      name: "Moving Average Cross Strategy", 
      strategy: "MA Cross", 
      timeframe: "1H",
      sl: "2%",
      target: "4%",
      tsl: "1.5%",
      status: "completed", 
      profit: 2.4, 
      trades: 15,
      winRate: 73.3,
      date: "2024-01-20 14:30",
      duration: "4h 23m"
    },
    { 
      id: 2, 
      name: "RSI Oversold Bounce", 
      strategy: "RSI Strategy", 
      timeframe: "15M",
      sl: "1.5%",
      target: "3%",
      tsl: "1%",
      status: "running", 
      profit: -0.8, 
      trades: 8,
      winRate: 62.5,
      date: "2024-01-20 16:45",
      duration: "Running..."
    },
    { 
      id: 3, 
      name: "Bollinger Bands Reversal", 
      strategy: "BB Strategy", 
      timeframe: "5M",
      sl: "1%",
      target: "2%",
      tsl: "0.5%",
      status: "completed", 
      profit: 1.2, 
      trades: 22,
      winRate: 68.2,
      date: "2024-01-19 11:15",
      duration: "6h 12m"
    },
    { 
      id: 4, 
      name: "Support Resistance Test", 
      strategy: "S&R Strategy", 
      timeframe: "30M",
      sl: "2.5%",
      target: "5%",
      tsl: "2%",
      status: "failed", 
      profit: -3.2, 
      trades: 5,
      winRate: 20.0,
      date: "2024-01-19 09:30",
      duration: "2h 45m"
    },
  ];

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.strategy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'running': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Runs</h1>
          <p className="text-muted-foreground">Manage and analyze your strategy backtests</p>
        </div>
        <Button className="gap-2">
          <Target className="w-4 h-4" />
          New Test
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tests by name or strategy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{test.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{test.strategy}</span>
                      <span>•</span>
                      <span>{test.timeframe}</span>
                      <span>•</span>
                      <span>SL: {test.sl}</span>
                      <span>•</span>
                      <span>Target: {test.target}</span>
                      <span>•</span>
                      <span>TSL: {test.tsl}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${test.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                      {test.profit > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span className="font-semibold text-lg">{test.profit > 0 ? '+' : ''}{test.profit}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total P&L</p>
                  </div>

                  <div className="text-right">
                    <div className="font-medium">{test.trades} trades</div>
                    <p className="text-xs text-muted-foreground">{test.winRate}% win rate</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">{test.date}</div>
                    <p className="text-xs text-muted-foreground">{test.duration}</p>
                  </div>

                  <Badge variant={getStatusColor(test.status)} className="capitalize">
                    {test.status}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Clone Test</DropdownMenuItem>
                      <DropdownMenuItem>Export Results</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tests found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or create a new test</p>
            <Button>Create New Test</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}