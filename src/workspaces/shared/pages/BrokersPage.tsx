/**
 * BrokersPage — broker account management.
 * Ported from AlgoHopperBot brokers.component.
 *
 * Features:
 * - Admin: UserSelector to view all users' brokers
 * - Client: own brokers only
 * - Add/Edit broker (Alice Blue only — Angel Broking shows "not configured" per Inc-9)
 * - Connect broker (opens login URL if not auto_login)
 * - Show Funds (calls account/profile/)
 * - Delete broker
 * - Password show/hide toggle
 * - Inc-9: onBrokerChanged, onLoginTypeChanged are empty stubs (replicate as-is)
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Link2, Wallet, Eye, EyeOff } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { brokerApi } from "@/services/api/broker.api";
import { notify, PageHeader, ConfirmDialog, StatusBadge, UserSelector, useAccounts } from "@/workspaces/shared";

const BROKERS = [
  { display_name: "Aliceblue", name: "ALICE_BLUE", _id: 0 },
  { display_name: "Angel", name: "ANGEL_BROKING", _id: 1 },
];

const LOGIN_TYPES = [
  { name: "Auto", _id: 0 },
  { name: "Manual", _id: 1 },
];

export function BrokersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBroker, setEditingBroker] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [fundsShown, setFundsShown] = useState<Record<string, number>>({});

  const accId = isAdmin ? selectedUserId : user?.id ?? "";

  // ── Auto-select first user for admin ──────────────────────────────────────
  const { data: accounts = [] } = useAccounts();
  useEffect(() => {
    if (isAdmin && !selectedUserId && accounts.length > 0) {
      setSelectedUserId(accounts[0]._id);
    }
  }, [isAdmin, selectedUserId, accounts]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ["brokers-detail", accId],
    queryFn: () => brokerApi.getUserBrokers({ acc_id: accId || undefined, dt: "details" }),
    enabled: !!accId || !isAdmin,
    select: (data) => data?.broker_accounts ?? [],
  });

  const addMutation = useMutation({
    mutationFn: brokerApi.addBroker,
    onSuccess: () => {
      notify.success("Broker Added Successfully");
      qc.invalidateQueries({ queryKey: ["brokers-detail", accId] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: brokerApi.updateBroker,
    onSuccess: () => {
      notify.success("Broker Updated Successfully");
      qc.invalidateQueries({ queryKey: ["brokers-detail", accId] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brokerApi.deleteBroker,
    onSuccess: () => {
      notify.success("Broker deleted successfully");
      qc.invalidateQueries({ queryKey: ["brokers-detail", accId] });
    },
  });

  const connectMutation = useMutation({
    mutationFn: brokerApi.connectBroker,
    onSuccess: (data: any) => {
      if (data.msg === "") {
        if (!data.auto_login && data.login_url) {
          window.open(data.login_url, "_blank");
        }
      } else {
        if (data.err === 1) {
          notify.error(data.msg);
        } else {
          notify.success(data.msg);
        }
      }
    },
  });

  const showFunds = async (broker: any) => {
    try {
      const res = await brokerApi.getProfile({ _id: broker._id } as any);
      if (res.funds?.available_margin) {
        setFundsShown((prev) => ({ ...prev, [broker._id]: res.funds.available_margin }));
      } else {
        notify.info("Funds data not available");
      }
    } catch {
      notify.error("Failed to fetch funds");
    }
  };

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    broker_name: 0,
    app_id: "",
    client_id: "",
    client_secret: "",
    password: "",
    t_fa: "",
    login_type: 1,
    valid_upto: "",
    state: "active",
  });
  const [showPwd, setShowPwd] = useState({ client_secret: false, password: false, t_fa: false });

  const openAdd = () => {
    setEditingBroker(null);
    setForm({ broker_name: 0, app_id: "", client_id: "", client_secret: "", password: "", t_fa: "", login_type: 1, valid_upto: "", state: "active" });
    setShowPwd({ client_secret: false, password: false, t_fa: false });
    setShowModal(true);
  };

  const openEdit = (broker: any) => {
    setEditingBroker(broker);
    setForm({
      broker_name: BROKERS.find((b) => b.name.toLowerCase() === broker.name?.toLowerCase())?._id ?? 0,
      app_id: broker.params?.app_id ?? "",
      client_id: broker.params?.client_id ?? "",
      client_secret: broker.params?.client_secret ?? "",
      password: broker.params?.password ?? "",
      t_fa: broker.params?.two_fa ?? "",
      login_type: broker.params?.auto_login ? 0 : 1,
      valid_upto: broker.subscription_upto ?? "",
      state: broker.state ?? "active",
    });
    setShowPwd({ client_secret: false, password: false, t_fa: false });
    setShowModal(true);
  };

  const handleSave = async () => {
    const selectedBroker = BROKERS.find((b) => b._id === form.broker_name);
    if (!selectedBroker) return;

    // Inc-9: only Alice Blue is configured
    if (selectedBroker.name.toLowerCase() !== "alice_blue") {
      notify.error("Broker not configured");
      return;
    }

    if (!form.app_id.trim() || !form.client_id.trim() || !form.client_secret.trim()) {
      notify.error("App ID, Client ID, and Client Secret are required.");
      return;
    }

    const params = {
      app_id: form.app_id,
      client_id: form.client_id,
      client_secret: form.client_secret,
      password: form.password,
      two_fa: form.t_fa,
      auto_login: form.login_type === 0,
    };

    if (editingBroker) {
      await updateMutation.mutateAsync({
        _id: editingBroker._id,
        name: selectedBroker.name,
        params,
        subscription_upto: form.valid_upto,
        state: form.state,
      } as any);
    } else {
      await addMutation.mutateAsync({
        account_id: accId,
        name: selectedBroker.name,
        params,
        subscription_upto: form.valid_upto,
        state: form.state,
      } as any);
    }
  };

  return (
    <div>
      <PageHeader
        title="Brokers"
        description="Manage broker API credentials"
        actions={
          <>
            {isAdmin && (
              <UserSelector
                value={selectedUserId}
                onValueChange={(v) => { setSelectedUserId(v); }}
                placeholder="Select user"
              />
            )}
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Broker
            </Button>
          </>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broker</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Valid Upto</TableHead>
                <TableHead>Funds</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No broker accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                brokers.map((ba: any) => (
                  <TableRow key={ba._id}>
                    <TableCell className="font-medium">{ba.name}</TableCell>
                    <TableCell>{ba.params?.client_id ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={ba.state === "active" ? "active" : "inactive"} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ba.subscription_upto || "—"}</TableCell>
                    <TableCell>
                      {fundsShown[ba._id] !== undefined ? (
                        <span className="text-sm font-medium">{fundsShown[ba._id]}</span>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => showFunds(ba)}>
                          <Wallet className="h-3.5 w-3.5" />
                          Show
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(ba)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => connectMutation.mutate({ _id: ba._id, bname: ba.name } as any)} disabled={connectMutation.isPending}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Connect
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(ba)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Broker Modal */}
      <Dialog open={showModal} onOpenChange={(o) => !addMutation.isPending && !updateMutation.isPending && setShowModal(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBroker ? "Update Broker" : "Add Broker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Broker *</Label>
              <Select value={String(form.broker_name)} onValueChange={(v) => setForm((f) => ({ ...f, broker_name: Number(v) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROKERS.map((b) => (
                    <SelectItem key={b._id} value={String(b._id)}>{b.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="space-y-1">
                <Label>Account ID</Label>
                <Input value={accId} disabled />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>App ID *</Label>
                <Input value={form.app_id} onChange={(e) => setForm((f) => ({ ...f, app_id: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Client ID *</Label>
                <Input value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Client Secret *</Label>
                <div className="relative">
                  <Input type={showPwd.client_secret ? "text" : "password"} value={form.client_secret} onChange={(e) => setForm((f) => ({ ...f, client_secret: e.target.value }))} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2" onClick={() => setShowPwd((s) => ({ ...s, client_secret: !s.client_secret }))}>
                    {showPwd.client_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPwd.password ? "text" : "password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2" onClick={() => setShowPwd((s) => ({ ...s, password: !s.password }))}>
                    {showPwd.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Two FA</Label>
                <div className="relative">
                  <Input type={showPwd.t_fa ? "text" : "password"} value={form.t_fa} onChange={(e) => setForm((f) => ({ ...f, t_fa: e.target.value }))} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2" onClick={() => setShowPwd((s) => ({ ...s, t_fa: !s.t_fa }))}>
                    {showPwd.t_fa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Login Type</Label>
                <Select value={String(form.login_type)} onValueChange={(v) => setForm((f) => ({ ...f, login_type: Number(v) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGIN_TYPES.map((lt) => (
                      <SelectItem key={lt._id} value={String(lt._id)}>{lt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Valid Upto</Label>
                <Input type="date" value={form.valid_upto} onChange={(e) => setForm((f) => ({ ...f, valid_upto: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBroker ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete broker?"
        description={`Are you sure you want to delete this broker account? This cannot be undone.`}
        onConfirm={async () => {
          if (confirmDelete) await deleteMutation.mutateAsync(confirmDelete._id);
          setConfirmDelete(null);
        }}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
