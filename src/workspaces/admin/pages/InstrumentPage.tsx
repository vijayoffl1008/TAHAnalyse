/**
 * InstrumentPage — admin CRUD for trading instruments (Nifty, Banknifty).
 * Ported from AlgoHopperBot instrument.component.
 * Route: /admin/entity/instruments
 *
 * Features:
 * - EntityTable: name, display_name, symbol, contract names, state badge
 * - Add/Edit instrument modal
 * - Activate/Deactivate toggle
 * - Expiry date management: nested dialog per instrument (year/month picker, add/delete dates)
 * - Pagination via EntityTable (Inc-6 fix)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit, Power, Calendar, Trash2, Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityTable, PageHeader, StatusBadge, ConfirmDialog, notify, type EntityTableColumn } from "@/workspaces/shared";
import { instrumentApi } from "@/services/api/instrument.api";

const EXPIRY_TYPES = [
  { id: 0, label: "Select" },
  { id: 1, label: "W" },
  { id: 2, label: "M" },
];

const CURRENT_YEAR = String(new Date().getFullYear());
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, "0");

export function InstrumentPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<any>(null);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryInstrument, setExpiryInstrument] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<any>({ open: false });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({ name: "", display_name: "", symbol: "", derivative_name: "", spot_name: "" });
  const [expiryForm, setExpiryForm] = useState({ year: CURRENT_YEAR, month: CURRENT_MONTH, expiry_date: "", expiry_type: "1" });

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: instrumentData, isLoading } = useQuery({
    queryKey: ["instruments", page, pageSize],
    queryFn: () => instrumentApi.listInstruments({ index: page, limit: pageSize }),
  });

  const instruments = instrumentData?.instruments ?? [];
  const totalCount = instrumentData?.total_count ?? 0;

  const { data: expiryDates = [], refetch: refetchExpiry } = useQuery({
    queryKey: ["instrument-expiry", expiryInstrument?._id, expiryForm.year, expiryForm.month],
    queryFn: () => instrumentApi.listInstrumentsExpiry(expiryInstrument._id, expiryForm.year, expiryForm.month),
    enabled: !!expiryInstrument,
    select: (data: any) => data.dates ?? [],
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: instrumentApi.addInstrument,
    onSuccess: () => { notify.success("Instrument added"); qc.invalidateQueries({ queryKey: ["instruments"] }); setShowModal(false); },
  });
  const updateMutation = useMutation({
    mutationFn: instrumentApi.updateInstrument,
    onSuccess: () => { notify.success("Instrument updated"); qc.invalidateQueries({ queryKey: ["instruments"] }); setShowModal(false); },
  });
  const activateMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: number }) => instrumentApi.activateInstrument(id, state),
    onSuccess: (_d, vars) => { notify.success(vars.state === 1 ? "Activated" : "Deactivated"); qc.invalidateQueries({ queryKey: ["instruments"] }); },
  });
  const addExpiryMutation = useMutation({
    mutationFn: (data: any) => instrumentApi.addInstrumentExpiry(data),
    onSuccess: () => { notify.success("Expiry date added"); refetchExpiry(); },
  });
  const deleteExpiryMutation = useMutation({
    mutationFn: (data: any) => instrumentApi.deleteInstrumentExpiry(data),
    onSuccess: () => { notify.success("Expiry date deleted"); refetchExpiry(); },
  });

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: EntityTableColumn<any>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "display_name", header: "Display Name", sortable: true },
    { key: "symbol", header: "Symbol" },
    { key: "derivative_name", header: "Derivative", cell: (r) => r.contract_details?.derivative_name ?? "—" },
    { key: "spot_name", header: "Spot", cell: (r) => r.contract_details?.spot_name ?? "—" },
    { key: "state", header: "State", cell: (r) => <StatusBadge status={r.state === "active" ? "active" : "inactive"} /> },
  ];

  const rowActions = [
    { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: (r: any) => { setEditingInstrument(r); setForm({ name: r.name, display_name: r.display_name, symbol: r.symbol, derivative_name: r.contract_details?.derivative_name ?? "", spot_name: r.contract_details?.spot_name ?? "" }); setShowModal(true); } },
    { label: "Expiry Dates", icon: <Calendar className="h-4 w-4" />, onClick: (r: any) => { setExpiryInstrument(r); setShowExpiryModal(true); } },
    {
      label: (r: any) => r.state === "active" ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: (r: any) => {
        const activating = r.state !== "active";
        setConfirmState({ open: true, title: activating ? "Activate?" : "Deactivate?", description: `${activating ? "Activate" : "Deactivate"} ${r.name}?`, confirmLabel: activating ? "Activate" : "Deactivate", destructive: !activating, onConfirm: async () => { await activateMutation.mutateAsync({ id: r._id, state: activating ? 1 : 0 }); setConfirmState({ open: false }); } });
      },
    },
  ];

  const handleSave = async () => {
    if (!form.name || !form.display_name || !form.symbol) { notify.error("Name, display name, and symbol are required."); return; }
    const payload = { name: form.name, display_name: form.display_name, symbol: form.symbol, contract_details: { derivative_name: form.derivative_name, spot_name: form.spot_name }, instrument_details: {} };
    if (editingInstrument) {
      await updateMutation.mutateAsync({ instrument_id: editingInstrument._id, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
  };

  return (
    <div>
      <PageHeader title="Instruments" description="Manage trading instruments"
        actions={
          <Button onClick={() => { setEditingInstrument(null); setForm({ name: "", display_name: "", symbol: "", derivative_name: "", spot_name: "" }); setShowModal(true); }} className="gap-2">
            <Plus className="h-4 w-4" />Add Instrument
          </Button>
        }
      />

      <EntityTable columns={columns} data={instruments} isLoading={isLoading} rowKey="_id" rowActions={rowActions as any}
        pagination={{
          totalItems: totalCount,
          itemsPerPage: pageSize,
          currentPage: page,
          onPageChange: setPage,
          pageSizeOptions: [5, 10, 25, 50],
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      {/* Add/Edit modal */}
      <Dialog open={showModal} onOpenChange={(o) => !addMutation.isPending && !updateMutation.isPending && setShowModal(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingInstrument ? "Update Instrument" : "Add Instrument"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Display Name *</Label><Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Symbol *</Label><Input value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Derivative Name</Label><Input value={form.derivative_name} onChange={(e) => setForm((f) => ({ ...f, derivative_name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Spot Name</Label><Input value={form.spot_name} onChange={(e) => setForm((f) => ({ ...f, spot_name: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingInstrument ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expiry management modal */}
      <Dialog open={showExpiryModal} onOpenChange={setShowExpiryModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Expiry Dates — {expiryInstrument?.display_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1"><Label>Year</Label><Input className="w-24" value={expiryForm.year} onChange={(e) => setExpiryForm((f) => ({ ...f, year: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Month</Label><Input className="w-20" value={expiryForm.month} onChange={(e) => setExpiryForm((f) => ({ ...f, month: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Expiry Date</Label><Input type="date" value={expiryForm.expiry_date} onChange={(e) => setExpiryForm((f) => ({ ...f, expiry_date: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={expiryForm.expiry_type} onValueChange={(v) => setExpiryForm((f) => ({ ...f, expiry_type: v }))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPIRY_TYPES.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={() => addExpiryMutation.mutate({ instrument_id: expiryInstrument._id, year: expiryForm.year, month: expiryForm.month, dates: [{ date: expiryForm.expiry_date, expiry: expiryForm.expiry_type }] })} disabled={addExpiryMutation.isPending} className="gap-2">
                {addExpiryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>

            {expiryDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No expiry dates for this month.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                  <TableBody>
                    {expiryDates.map((exp: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{exp.date}</TableCell>
                        <TableCell>{exp.expiry}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                            const parts = exp.date.split("-");
                            deleteExpiryMutation.mutate({ instrument_id: expiryInstrument._id, year: parts[0], month: parts[1], dates: exp.date });
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpiryModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => !o && setConfirmState({ open: false })}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm ?? (() => {})}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        isLoading={activateMutation.isPending}
      />
    </div>
  );
}
