/**
 * DataCollectionPage — admin market data collection tool.
 * Ported from AlgoHopperBot data-collection.component.
 *
 * Layout goal: everything fits in the viewport without scrolling.
 * - Top row: Feed Token input + Save (single line)
 * - Middle row: Date | Category | all action buttons (single row)
 * - Bottom: Data Status table fills remaining space
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Play, Square, RefreshCw, Save, Archive, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PageHeader, DateRangePicker, notify } from "@/workspaces/shared";
import { dataCollectionApi } from "@/services/api/data-collection.api";
import { configApi } from "@/services/api/config.api";

export function DataCollectionPage() {
  const today = format(new Date(), "yyyyMMdd");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [feedToken, setFeedToken] = useState("");
  const [statusRows, setStatusRows] = useState<any[]>([]);

  const dateStr = selectedDate ? format(selectedDate, "yyyyMMdd") : today;

  // ── Categories ─────────────────────────────────────────────────────────────
  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ["dc-categories"],
    queryFn: dataCollectionApi.getCategories,
    select: (data) => {
      const cats = [{ index: "11", display_name: "All" }];
      (data.categories ?? []).forEach((c: any) => cats.push({ index: String(c.index), display_name: c.display_name }));
      return cats;
    },
  });

  const categories = categoriesData ?? [{ index: "11", display_name: "All" }];

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(String(categories[0].index));
    }
  }, [selectedCategory, categories]);

  // ── Feed token ─────────────────────────────────────────────────────────────
  const { data: tokenData } = useQuery({
    queryKey: ["dc-token"],
    queryFn: () => configApi.getConfigData("dc_token"),
  });

  useEffect(() => {
    const token = (tokenData as any)?.cds?.[0]?.dc_token;
    if (token) setFeedToken(token);
  }, [tokenData]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const saveToken = useMutation({
    mutationFn: () => configApi.updateCDatas([{ key: "dc_token", value: feedToken }]),
    onSuccess: () => notify.success("Token Updated Successfully"),
  });

  const runData = useMutation({
    mutationFn: () => dataCollectionApi.runData(dateStr, selectedCategory),
    onSuccess: () => notify.success("Data collection started"),
  });

  const stopData = useMutation({
    mutationFn: dataCollectionApi.stopData,
    onSuccess: () => notify.success("Data collection stopped"),
  });

  const checkStatus = useMutation({
    mutationFn: () => dataCollectionApi.checkDataRunStatus(),
    onSuccess: (data: any) => notify.info(`Status: ${data?.status ?? "—"}`),
  });

  const checkDataStatus = useMutation({
    mutationFn: () => dataCollectionApi.checkDataStatus(dateStr, selectedCategory),
    onSuccess: (data: any) => {
      const result = data?.result?.data ?? {};
      const rows = Object.keys(result).map((key) => ({
        category: key.toUpperCase(),
        m_count: result[key]?.["1m"] ?? "NA",
        d_count: result[key]?.["1d"] ?? "NA",
      }));
      setStatusRows(rows);
    },
  });

  const splitCategory = useMutation({
    mutationFn: () => dataCollectionApi.splitCategories(dateStr),
    onSuccess: (data: any) => {
      const ok = (data?.result?.status ?? "").toLowerCase() === "ok";
      ok ? notify.success("Split successful") : notify.error("Split failed");
    },
  });

  const archiveData = useMutation({
    mutationFn: () => dataCollectionApi.archieveData(dateStr),
    onSuccess: () => notify.success("Archive started"),
  });

  const stopArchive = useMutation({
    mutationFn: dataCollectionApi.stopArchieveData,
    onSuccess: (data: any) => notify.info(`Result: ${data?.result ?? "—"}`),
  });

  const checkArchiveStatus = useMutation({
    mutationFn: dataCollectionApi.archieveDataRunStatus,
    onSuccess: (data: any) => notify.info(`Archive Status: ${data?.status ?? "—"}`),
  });

  const anyPending =
    runData.isPending || stopData.isPending || checkStatus.isPending ||
    checkDataStatus.isPending || splitCategory.isPending ||
    archiveData.isPending || stopArchive.isPending || checkArchiveStatus.isPending;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* <PageHeader title="Data Collection" description="Market data collection management" /> *}

      {/* ── Row 1: Feed token ────────────────────────────────────────────── */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Feed Token</label>
          <Input
            value={feedToken}
            onChange={(e) => setFeedToken(e.target.value)}
            placeholder="Enter feed token"
            className="h-8"
          />
        </div>
        <Button size="sm" onClick={() => saveToken.mutate()} disabled={saveToken.isPending} className="gap-1 h-8">
          {saveToken.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save
        </Button>
      </div>

      {/* ── Row 2: Date + Category ──────────────────────────────────────── */}
      <div className="rounded-md border bg-muted/30 px-3 pt-3 pb-2 flex items-end gap-4">
        {/* Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
          <DateRangePicker value={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd" />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
          {catLoading ? (
            <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          ) : (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.index} value={String(c.index)}>{c.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ── Row 3: All action buttons ────────────────────────────────────── */}
      <div className="rounded-md border bg-muted/30 px-3 py-2 flex flex-wrap items-center gap-2">
        {/* Data collection actions */}
        <Button size="sm" onClick={() => runData.mutate()} disabled={anyPending} className="gap-1 h-9">
          {runData.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          Run
        </Button>
        <Button size="sm" variant="outline" onClick={() => stopData.mutate()} disabled={anyPending} className="gap-1 h-9">
          <Square className="h-3 w-3" />
          Stop
        </Button>
        <Button size="sm" variant="outline" onClick={() => checkStatus.mutate()} disabled={anyPending} className="gap-1 h-9">
          {checkStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Run Status
        </Button>
        <Button size="sm" variant="secondary" onClick={() => checkDataStatus.mutate()} disabled={anyPending} className="gap-1 h-9">
          {checkDataStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Check Data
        </Button>
        <Button size="sm" variant="outline" onClick={() => splitCategory.mutate()} disabled={anyPending} className="gap-1 h-9">
          {splitCategory.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <SplitSquareHorizontal className="h-3 w-3" />}
          Split
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Archive actions */}
        <Button size="sm" variant="outline" onClick={() => archiveData.mutate()} disabled={anyPending} className="gap-1 h-9">
          {archiveData.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
          Archive
        </Button>
        <Button size="sm" variant="outline" onClick={() => stopArchive.mutate()} disabled={anyPending} className="gap-1 h-9">
          <Square className="h-3 w-3" />
          Stop Archive
        </Button>
        <Button size="sm" variant="outline" onClick={() => checkArchiveStatus.mutate()} disabled={anyPending} className="gap-1 h-9">
          {checkArchiveStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Archive Status
        </Button>
      </div>

      {/* ── Row 4: Data Status (max 10 items, card grid) ────────────────── */}
      <div className="rounded-md border flex flex-col min-h-0">
        <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
          <span className="text-sm font-medium">Data Status</span>
          {statusRows.length > 0 && (
            <span className="text-xs text-muted-foreground">{statusRows.length} categories</span>
          )}
        </div>

        {statusRows.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Click "Check Data" to load results.
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {statusRows.map((row, idx) => (
              <div
                key={idx}
                className="rounded-md border bg-muted/40 px-3 py-2 flex flex-col gap-1"
              >
                <span className="text-xs font-semibold text-foreground truncate">{row.category}</span>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>1m</span>
                  <span className="font-medium text-foreground">{row.m_count}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>1D</span>
                  <span className="font-medium text-foreground">{row.d_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
