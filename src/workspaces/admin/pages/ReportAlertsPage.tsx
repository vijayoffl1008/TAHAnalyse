/**
 * ReportAlertsPage — admin reporting alert configuration.
 * Ported from AlgoHopperBot report-alerts.component.
 *
 * Features:
 * - EntityTable: report name, type (daily/monthly), status badge
 * - Add/Edit report (CRUD)
 * - Toggle enable/disable (PUT report/status/)
 * - View modal: per-strategy data entry + generate + download PDF
 *
 * Gap-4 replicated (as-is):
 * - loadSegments() commented out — segments never loaded
 * - listSymbols() commented out — symbol selection non-functional
 * - onInputTypeChanged, onPeriodChanged, on_no_data, onSymbolSelected — empty stubs
 *
 * Dead code DC-5 removed: no 'import { rejects } from "assert"'
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Download, RefreshCw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { EntityTable, PageHeader, StatusBadge, ConfirmDialog, DateRangePicker, notify, type EntityTableColumn } from "@/workspaces/shared";
import { reportApiService } from "@/services/api/report.api";

const PERIOD_OPTIONS = [
  { _id: "daily", name: "Daily" },
  { _id: "monthly", name: "Monthly" },
];

const INPUT_TYPES = [
  { _id: "order_matching", name: "Order Matching" },
  { _id: "state_file", name: "State File" },
  { _id: "manual", name: "Manual" },
];

export function ReportAlertsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [viewReport, setViewReport] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [viewDate, setViewDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<any>(null);
  const [form, setForm] = useState({ name: "", period: "daily", strategies: [] as any[] });

  const dateStr = viewDate ? format(viewDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportApiService.list(),
    select: (data: any) => data.reports ?? [],
  });

  const addMutation = useMutation({
    mutationFn: reportApiService.add,
    onSuccess: () => { notify.success("Report added"); qc.invalidateQueries({ queryKey: ["reports"] }); setShowModal(false); },
  });
  const updateMutation = useMutation({
    mutationFn: reportApiService.update,
    onSuccess: () => { notify.success("Report updated"); qc.invalidateQueries({ queryKey: ["reports"] }); setShowModal(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: reportApiService.deleteReport,
    onSuccess: () => { notify.success("Report deleted"); qc.invalidateQueries({ queryKey: ["reports"] }); },
  });
  const statusMutation = useMutation({
    mutationFn: reportApiService.update_status,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reports"] }); },
  });
  const generateMutation = useMutation({
    mutationFn: (force: boolean) => reportApiService.generate_report(viewReport.report_id, dateStr, force),
    onSuccess: () => { notify.success("Report generated"); loadReportData(); },
  });
  const downloadMutation = useMutation({
    mutationFn: () => reportApiService.download_report(viewReport.report_id, dateStr),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${viewReport.report_id}_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const loadReportData = async () => {
    if (!viewReport) return;
    try {
      const data = await reportApiService.get_report_data(viewReport.report_id, dateStr);
      setReportData(data);
    } catch { notify.error("Failed to load report data"); }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: EntityTableColumn<any>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "type", header: "Period", cell: (r) => r.type },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status === "active" ? "active" : "inactive"} /> },
    { key: "strategies", header: "Strategies", cell: (r) => String(r.strategies?.length ?? 0) },
  ];

  const rowActions = [
    { label: "View", icon: <Eye className="h-4 w-4" />, onClick: (r: any) => { setViewReport(r); setReportData(null); } },
    { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: (r: any) => { setEditingReport(r); setForm({ name: r.name, period: r.type, strategies: r.strategies ?? [] }); setShowModal(true); } },
    {
      label: (r: any) => r.status === "active" ? "Disable" : "Enable",
      icon: <Power className="h-4 w-4" />,
      onClick: (r: any) => statusMutation.mutate({ report_id: r.report_id, status: r.status === "active" ? "inactive" : "active" }),
    },
    { label: "Delete", icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: (r: any) => setConfirmDelete(r) },
  ];

  const handleSave = async () => {
    if (!form.name || !form.period) { notify.error("Name and period are required."); return; }
    const payload = { name: form.name, type: form.period, strategies: form.strategies };
    if (editingReport) {
      await updateMutation.mutateAsync({ report_id: editingReport.report_id, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
  };

  // Gap-4 stubs (replicate as-is)
  const onInputTypeChanged = () => {};
  const onPeriodChanged = () => {};
  const on_no_data = () => {};
  const onSymbolSelected = () => {};

  return (
    <div>
      <PageHeader title="Reports" description="Manage strategy PnL report configurations"
        actions={
          <Button onClick={() => { setEditingReport(null); setForm({ name: "", period: "daily", strategies: [] }); setShowModal(true); }} className="gap-2">
            <Plus className="h-4 w-4" />Add Report
          </Button>
        }
      />

      <EntityTable columns={columns} data={reports} isLoading={isLoading} rowKey="report_id" rowActions={rowActions as any} />

      {/* Add/Edit modal */}
      <Dialog open={showModal} onOpenChange={(o) => !addMutation.isPending && !updateMutation.isPending && setShowModal(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingReport ? "Update Report" : "Add Report"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Period *</Label>
              <Select value={form.period} onValueChange={(v) => setForm((f) => ({ ...f, period: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PERIOD_OPTIONS.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Strategy configuration (per-report) is available in the view modal.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingReport ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View / data entry modal */}
      {viewReport && (
        <Dialog open={!!viewReport} onOpenChange={(o) => !o && setViewReport(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Report: {viewReport.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <Label>Date</Label>
                  <DateRangePicker value={viewDate} onChange={setViewDate} dateFormat="yyyy-MM-dd" />
                </div>
                <Button variant="outline" onClick={loadReportData}>Load Data</Button>
                <Button variant="outline" onClick={() => generateMutation.mutate(false)} disabled={generateMutation.isPending} className="gap-2">
                  {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Generate
                </Button>
                <Button variant="outline" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending} className="gap-2">
                  {downloadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download PDF
                </Button>
              </div>

              {/* Report data */}
              {reportData && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Report Data</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(reportData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Symbol selection — Gap-4 disabled */}
              <div className="p-3 bg-muted/40 rounded text-xs text-muted-foreground">
                Symbol selection is not available (Gap-4 — segments and symbols not loaded, replicated as-is from Angular).
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewReport(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete report?"
        description={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={async () => { if (confirmDelete) await deleteMutation.mutateAsync(confirmDelete.report_id); setConfirmDelete(null); }}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
