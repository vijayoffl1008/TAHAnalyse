/**
 * AdminDashboard — system overview for admin index route (/admin).
 * Replaces the blank admin index with a useful landing page.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, Settings } from "lucide-react";
import { accountApi } from "@/services/api/account.api";
import { strategyApi } from "@/services/api/strategy.api";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { data: accounts = [], isLoading: accLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountApi.listAccounts().then((r) => r.accounts),
  });

  const { data: strategies = [], isLoading: stratLoading } = useQuery({
    queryKey: ["strategy-entities"],
    queryFn: () => strategyApi.listStrategies().then((r) => r.strategies),
  });

  const activeUsers = accounts.filter((a: any) => a.state === "active").length;
  const activeStrategies = strategies.filter((s: any) => s.state === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold">{accounts.length}</div>
            )}
            <p className="text-xs text-muted-foreground">{activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Strategy Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stratLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold">{strategies.length}</div>
            )}
            <p className="text-xs text-muted-foreground">{activeStrategies} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Online</div>
            <p className="text-xs text-muted-foreground">All services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Config</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">See Settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
