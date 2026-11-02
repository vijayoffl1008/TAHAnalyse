/**
 * ClientDashboardPage — PnL overview.
 * Ported from AlgoHopperBot dashboard.component.
 *
 * Uses recharts (already installed) instead of Chart.js.
 * Gap-2: CLIENT endpoints remain "test/" — replicate as-is.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { clientApi } from "@/services/api/client.api";
import { PageHeader, ConfirmDialog, notify } from "@/workspaces/shared";
import { Skeleton } from "@/components/ui/skeleton";

// ── Report periods (matching Angular dashboard) ───────────────────────────────
const REPORT_PERIODS = [
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_5_days", label: "Last 5 Days" },
  { value: "last_10_days", label: "Last 10 Days" },
  { value: "last_week", label: "Last Week" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_year", label: "Last Year" },
];

export function ClientDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("this_week");
  const [closeLegConfirm, setCloseLegConfirm] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>({ open: false, onConfirm: () => {} });

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: strategiesData, isLoading: stratLoading } = useQuery({
    queryKey: ["client-strategies"],
    queryFn: () => clientApi.getStrategies("all"),
    // Gap-2: endpoints point to "test/" — may return empty/error
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["client-report", selectedPeriod],
    queryFn: () => clientApi.getReport("all"),
    // Gap-2: selected period not sent to API (Angular never sent it either)
  });

  // ── Process strategies ────────────────────────────────────────────────────
  const completed = (strategiesData?.completed ?? []).map((s) => {
    let pnl = 0;
    (s.legs ?? []).forEach((legName: string) => {
      const leg = (s as any)[legName];
      if (leg?.entry !== undefined && leg?.exit !== undefined) {
        pnl += ((leg.exit - leg.entry) * (leg.position === "sell" ? -1 : 1)) * leg.quantity;
      }
    });
    return { ...s, pnl };
  });

  const running = (strategiesData?.running ?? []).map((s) => {
    let pnl = 0;
    (s.legs ?? []).forEach((legName: string) => {
      const leg = (s as any)[legName];
      if (leg?.entry !== undefined && leg?.exit !== undefined) {
        pnl += ((leg.exit - leg.entry) * (leg.position === "sell" ? -1 : 1)) * leg.quantity;
      }
    });
    return { ...s, pnl };
  });

  // ── Total PnL ───────────────────────────────────────────────────────────────
  const totalPnl = [...completed, ...running].reduce((sum, s) => sum + (s.pnl ?? 0), 0);

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = (reportData?.reports ?? []).map((r) => ({
    date: r.date,
    pnl: r.pnl,
  }));

  // ── Close leg (Gap-2: sends empty params) ────────────────────────────────────
  const handleCloseLeg = async () => {
    await clientApi.closeLeg();
    notify.success("Leg closed");
  };

  // ── PnL formatting ───────────────────────────────────────────────────────────
  const formatPnl = (pnl: number) => {
    const formatted = pnl.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    return `${pnl < 0 ? "" : "+"}${formatted}`;
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="PnL overview and strategy positions"
      />

      {/* ── Total PnL Card ─────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total PnL</p>
              <div className="flex items-center gap-2 mt-1">
                {totalPnl < 0 ? (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-success" />
                )}
                <span className={`text-2xl font-bold ${totalPnl < 0 ? "text-destructive" : "text-success"}`}>
                  {formatPnl(totalPnl)}
                </span>
              </div>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── PnL Chart ──────────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profit / Loss</CardTitle>
          <CardDescription>Daily PnL breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {reportLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No report data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [formatPnl(value), "PnL"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.pnl > 0 ? "hsl(var(--success))" : entry.pnl < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Running Strategies ─────────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Running Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          {stratLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : running.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No running strategies.</p>
          ) : (
            <div className="space-y-4">
              {running.map((s, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.name}</span>
                    <span className={`font-semibold ${s.pnl < 0 ? "text-destructive" : "text-success"}`}>
                      {formatPnl(s.pnl)}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(s.legs ?? []).map((legName: string) => {
                      const leg = (s as any)[legName];
                      if (!leg) return null;
                      return (
                        <div key={legName} className="text-xs px-2 py-1 bg-muted rounded flex items-center gap-2">
                          <span className="font-medium uppercase">{legName}</span>
                          <span>{leg.strike} {leg.option_type}</span>
                          <span className="text-muted-foreground">{leg.position} ×{leg.quantity}</span>
                          {leg.entry !== undefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (leg.exit) return; // already closed
                                setCloseLegConfirm({
                                  open: true,
                                  onConfirm: async () => {
                                    await handleCloseLeg();
                                    setCloseLegConfirm((s) => ({ ...s, open: false }));
                                  },
                                });
                              }}
                              disabled={!!leg.exit}
                            >
                              {leg.exit ? "Closed" : "Close"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Completed Strategies ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          {stratLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : completed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No completed strategies.</p>
          ) : (
            <div className="space-y-4">
              {completed.map((s, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.name}</span>
                    <span className={`font-semibold ${s.pnl < 0 ? "text-destructive" : "text-success"}`}>
                      {formatPnl(s.pnl)}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(s.legs ?? []).map((legName: string) => {
                      const leg = (s as any)[legName];
                      if (!leg) return null;
                      return (
                        <div key={legName} className="text-xs px-2 py-1 bg-muted rounded">
                          <span className="font-medium uppercase">{legName}</span>{" "}
                          <span>{leg.strike} {leg.option_type}</span>{" "}
                          <span className="text-muted-foreground">{leg.position} ×{leg.quantity}</span>{" "}
                          <span className="text-muted-foreground">
                            {leg.entry} → {leg.exit ?? "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={closeLegConfirm.open}
        onOpenChange={(o) => setCloseLegConfirm((s) => ({ ...s, open: o }))}
        title="Close leg?"
        description="Are you sure you want to close this position?"
        onConfirm={closeLegConfirm.onConfirm}
        confirmLabel="Close"
      />
    </div>
  );
}
