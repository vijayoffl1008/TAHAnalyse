/**
 * StrategyEntityPage — admin CRUD for master strategy definitions.
 * Ported from AlgoHopperBot strategy.component.
 * Route: /admin/entity/strategy
 *
 * Fixes Gap-5: delete uses ConfirmDialog with direct onConfirm callback.
 * Fixes Inc-6: EntityTable pagination ready.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Globe, Lock, Power } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  EntityTable,
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  type EntityTableColumn,
} from "@/workspaces/shared";
import { strategyApi, type StrategyEntity } from "@/services/api/strategy.api";
import { notify } from "@/workspaces/shared";
import { CONSTANTS } from "@/lib/constants";

export function StrategyEntityPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StrategyEntity | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    destructive: boolean;
    confirmLabel: string;
  }>({ open: false, title: "", description: "", onConfirm: () => {}, destructive: false, confirmLabel: "" });

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: strategyData, isLoading } = useQuery({
    queryKey: ["strategy-entities", page, pageSize],
    queryFn: () => strategyApi.listStrategies({ index: page, limit: pageSize }),
  });

  const strategies = strategyData?.strategies ?? [];
  const totalCount = strategyData?.total_count ?? 0;

  const addMutation = useMutation({
    mutationFn: strategyApi.addStrategy,
    onSuccess: () => {
      notify.success("Strategy added successfully");
      qc.invalidateQueries({ queryKey: ["strategy-entities"] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: strategyApi.updateStrategy,
    onSuccess: () => {
      notify.success("Strategy updated successfully");
      qc.invalidateQueries({ queryKey: ["strategy-entities"] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: strategyApi.deleteStrategy,
    onSuccess: () => {
      notify.success("Strategy deleted successfully");
      qc.invalidateQueries({ queryKey: ["strategy-entities"] });
    },
  });

  const stateMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) =>
      strategyApi.updateStrategyState(id, state),
    onSuccess: () => {
      notify.success("Updated Successfully");
      qc.invalidateQueries({ queryKey: ["strategy-entities"] });
    },
  });

  const scopeMutation = useMutation({
    mutationFn: ({ id, scope }: { id: string; scope: string }) =>
      strategyApi.updateStrategyScope(id, scope),
    onSuccess: () => {
      notify.success("Updated Successfully");
      qc.invalidateQueries({ queryKey: ["strategy-entities"] });
    },
  });

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: EntityTableColumn<StrategyEntity>[] = [
    { key: "name", header: "Name", sortable: true, cell: (s) => s.name },
    { key: "display_name", header: "Display Name", sortable: true, cell: (s) => s.display_name },
    { key: "type", header: "Type", cell: (s) => s.type },
    { key: "script", header: "Script", cell: (s) => s.script },
    {
      key: "state",
      header: "State",
      cell: (s) => <StatusBadge status={s.state === "active" ? "active" : "inactive"} />,
    },
    {
      key: "scope",
      header: "Scope",
      cell: (s) => (
        <span className="flex items-center gap-1 text-xs">
          {s.scope === "public" ? (
            <Globe className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          {s.scope}
        </span>
      ),
    },
  ];

  // ── Row actions ────────────────────────────────────────────────────────────
  const rowActions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (s: StrategyEntity) => {
        setEditing(s);
        setShowModal(true);
      },
    },
    {
      label: (s: StrategyEntity) => (s.state === "active" ? "Deactivate" : "Activate"),
      icon: <Power className="h-4 w-4" />,
      onClick: (s: StrategyEntity) => {
        const activating = s.state !== "active";
        setConfirmState({
          open: true,
          title: activating ? "Activate strategy?" : "Deactivate strategy?",
          description: `Are you sure you want to ${activating ? "activate" : "deactivate"} ${s.name}?`,
          confirmLabel: activating ? "Activate" : "Deactivate",
          destructive: !activating,
          onConfirm: async () => {
            await stateMutation.mutateAsync({
              id: s._id,
              state: activating ? "active" : "inactive",
            });
            setConfirmState((st) => ({ ...st, open: false }));
          },
        });
      },
    },
    {
      label: (s: StrategyEntity) =>
        s.scope === "public" ? "Make Private" : "Make Public",
      icon: <Globe className="h-4 w-4" />,
      onClick: (s: StrategyEntity) => {
        const makingPublic = s.scope !== "public";
        setConfirmState({
          open: true,
          title: makingPublic ? "Make public?" : "Make private?",
          description: `Make ${s.name} ${makingPublic ? "public" : "private"}?`,
          confirmLabel: makingPublic ? "Make Public" : "Make Private",
          destructive: false,
          onConfirm: async () => {
            await scopeMutation.mutateAsync({
              id: s._id,
              scope: makingPublic ? "public" : "private",
            });
            setConfirmState((st) => ({ ...st, open: false }));
          },
        });
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      onClick: (s: StrategyEntity) => {
        setConfirmState({
          open: true,
          title: "Delete strategy?",
          description: `Are you sure you want to delete ${s.name}? This action cannot be undone.`,
          confirmLabel: "Delete",
          destructive: true,
          onConfirm: async () => {
            await deleteMutation.mutateAsync(s._id);
            setConfirmState((st) => ({ ...st, open: false }));
          },
        });
      },
    },
  ];

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    type: "",
    config_capital_buy: "",
    config_capital_sell: "",
    script: "",
    script_details: "",
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", display_name: "", type: "", config_capital_buy: "", config_capital_sell: "", script: "", script_details: "" });
    setShowModal(true);
  };

  const openEdit = (s: StrategyEntity) => {
    setEditing(s);
    setForm({
      name: s.name,
      display_name: s.display_name,
      type: s.type,
      config_capital_buy: s.config?.capital?.buy ?? "",
      config_capital_sell: s.config?.capital?.sell ?? "",
      script: s.script,
      script_details: typeof s.script_details === "object" ? JSON.stringify(s.script_details) : String(s.script_details ?? ""),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.display_name || !form.type || !form.config_capital_buy || !form.config_capital_sell || !form.script) {
      notify.error("All fields except Script Details are required.");
      return;
    }

    let scriptDetails: Record<string, unknown> = {};
    if (form.script_details) {
      try {
        scriptDetails = JSON.parse(form.script_details);
      } catch {
        notify.error("Script Details must be valid JSON.");
        return;
      }
    }

    const payload = {
      name: form.name,
      display_name: form.display_name,
      type: form.type,
      config: { capital: { buy: form.config_capital_buy, sell: form.config_capital_sell } },
      script: form.script,
      script_details: scriptDetails,
    };

    if (editing) {
      await updateMutation.mutateAsync({ ...payload, strategy_id: editing._id });
    } else {
      await addMutation.mutateAsync(payload);
    }
  };

  return (
    <div>
      <PageHeader
        title="Strategy Entities"
        description="Manage master strategy definitions"
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Strategy
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={strategies}
        isLoading={isLoading}
        rowKey="_id"
        rowActions={rowActions as any}
        pagination={{
          totalItems: totalCount,
          itemsPerPage: pageSize,
          currentPage: page,
          onPageChange: setPage,
          pageSizeOptions: [5, 10, 25, 50],
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(o) => !addMutation.isPending && !updateMutation.isPending && setShowModal(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Update Strategy" : "Add Strategy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Display Name *</Label>
                <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Type *</Label>
              <Input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="e.g. lss_v1, orb_v1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Capital Buy *</Label>
                <Input value={form.config_capital_buy} onChange={(e) => setForm((f) => ({ ...f, config_capital_buy: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Capital Sell *</Label>
                <Input value={form.config_capital_sell} onChange={(e) => setForm((f) => ({ ...f, config_capital_sell: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Script *</Label>
              <Select value={form.script} onValueChange={(v) => setForm((f) => ({ ...f, script: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select script type" />
                </SelectTrigger>
                <SelectContent>
                  {CONSTANTS.SCRIPT_TYPES.map((st) => (
                    <SelectItem key={st._id} value={st._id}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Script Details (JSON)</Label>
              <Textarea
                value={form.script_details}
                onChange={(e) => setForm((f) => ({ ...f, script_details: e.target.value }))}
                placeholder='{"key": "value"}'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              {addMutation.isPending || updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        destructive={confirmState.destructive}
        confirmLabel={confirmState.confirmLabel}
        isLoading={deleteMutation.isPending || stateMutation.isPending || scopeMutation.isPending}
      />
    </div>
  );
}
