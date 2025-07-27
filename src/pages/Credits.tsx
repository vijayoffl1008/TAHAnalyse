import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Plus, 
  History,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Zap
} from "lucide-react";

export default function Credits() {
  const currentCredits = 1250;

  // Mock transaction history
  const transactions = [
    {
      id: 1,
      type: "purchase",
      amount: 500,
      description: "Credits Purchase - Pro Pack",
      date: "2024-01-20 14:30",
      status: "completed"
    },
    {
      id: 2,
      type: "usage",
      amount: -25,
      description: "Test Run - Moving Average Strategy",
      date: "2024-01-20 12:15",
      status: "completed"
    },
    {
      id: 3,
      type: "usage",
      amount: -15,
      description: "Test Run - RSI Strategy",
      date: "2024-01-20 10:45",
      status: "completed"
    },
    {
      id: 4,
      type: "purchase",
      amount: 1000,
      description: "Credits Purchase - Starter Pack",
      date: "2024-01-19 16:20",
      status: "completed"
    },
    {
      id: 5,
      type: "usage",
      amount: -30,
      description: "Test Run - Bollinger Bands Strategy",
      date: "2024-01-19 14:10",
      status: "completed"
    }
  ];

  const creditPackages = [
    {
      id: 1,
      name: "Starter Pack",
      credits: 500,
      price: 29,
      popular: false,
      features: ["500 test credits", "Basic strategies", "Email support"]
    },
    {
      id: 2,
      name: "Pro Pack",
      credits: 1500,
      price: 79,
      popular: true,
      features: ["1,500 test credits", "All strategies", "Priority support", "Advanced analytics"]
    },
    {
      id: 3,
      name: "Enterprise Pack",
      credits: 5000,
      price: 199,
      popular: false,
      features: ["5,000 test credits", "Custom strategies", "Dedicated support", "API access"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Credits Management</h1>
          <p className="text-muted-foreground">Manage your testing credits and view transaction history</p>
        </div>
      </div>

      {/* Current Credits */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentCredits.toLocaleString()}</h2>
                <p className="text-muted-foreground">Available Credits</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Credits are used for:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Strategy backtesting</li>
                <li>• Real-time analysis</li>
                <li>• Data processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Purchase Credits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Coins className="w-5 h-5 text-warning" />
                  <span className="text-2xl font-bold">{pkg.credits.toLocaleString()}</span>
                  <span className="text-muted-foreground">credits</span>
                </div>
                <div className="text-3xl font-bold text-primary">${pkg.price}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full gap-2 ${pkg.popular ? '' : 'variant-outline'}`}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-semibold">Transaction History</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'purchase' ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      {transaction.type === 'purchase' ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.type === 'purchase' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {transaction.type === 'purchase' ? '+' : ''}{transaction.amount.toLocaleString()}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}