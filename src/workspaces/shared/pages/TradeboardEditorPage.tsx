/**
 * TradeboardEditorPage — tab-based tradeboard editor.
 * Ported from AlgoHopperBot tradeboard.component + tradeboard-content.component.
 *
 * Gap-3: placeOrder, placeExitOrder, modifyOrder, cancelOrder, refreshDatas
 * and all type-change handlers are empty stubs (replicate as-is).
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2, X } from "lucide-react";
import { PageHeader, TabbedView, notify } from "@/workspaces/shared";
import { tradeboardApi } from "@/services/api/tradeboard.api";
import { brokerApi } from "@/services/api/broker.api";

const SYMBOLS = [
  { name: "Nifty", lot_size: 50, min_size: 50, max_size: 1000, strike_diff: 50 },
  { name: "Banknifty", lot_size: 25, min_size: 25, max_size: 1000, strike_diff: 100 },
];
const PRODUCT_TYPES = ["MIS", "NRML"];
const OPTION_TYPES = ["CE", "PE"];
const ORDER_TYPES = ["MKT", "LIMIT", "SL"];
const TGT_TYPES = ["Percent", "Pts"];
const SL_TYPES = ["Percent", "Pts"];
const TSL_TYPES = ["Target", "Percent", "Pts"];

export function TradeboardEditorPage({ basePath }: { basePath: string }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const isNew = name === "new" || !name;

  // ── Load tradeboard details (edit mode) ────────────────────────────────────
  const { data: tbData } = useQuery({
    queryKey: ["tradeboard-details", name],
    queryFn: () => tradeboardApi.getTradeboardDetails(name!),
    enabled: !isNew && !!name,
  });

  // ── Load all broker accounts ──────────────────────────────────────────────
  const { data: bas = [] } = useQuery({
    queryKey: ["all-brokers"],
    queryFn: () => brokerApi.getAllBrokers({ bname: "alice_blue" }).then((r: any) => r.bas ?? []),
  });

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    symbol: "Nifty",
    product_type: "MIS",
    quantity: 50,
    users: [] as any[],
    contracts: [] as any[],
    tgt_type: "Percent",
    tgt_value: 0,
    sl_type: "Percent",
    sl_value: 0,
    tsl_type: "Target",
    tsl_value: 0,
  });

  useEffect(() => {
    if (tbData?.tradeboard) {
      const tb = tbData.tradeboard as any;
      setForm({
        name: tb.name ?? "",
        symbol: tb.params?.symbol ?? "Nifty",
        product_type: tb.params?.product_type ?? "MIS",
        quantity: tb.params?.quantity ?? 50,
        users: tb.users ?? [],
        contracts: tb.contracts ?? [],
        tgt_type: tb.tgt?.type?.name ?? "Percent",
        tgt_value: tb.tgt?.value ?? 0,
        sl_type: tb.sl?.type?.name ?? "Percent",
        sl_value: tb.sl?.value ?? 0,
        tsl_type: tb.tsl?.type?.name ?? "Target",
        tsl_value: tb.tsl?.value ?? 0,
      });
    }
  }, [tbData]);

  // ── Save mutation ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        params: {
          symbol: form.symbol,
          product_type: form.product_type,
          quantity: form.quantity,
        },
        users: form.users,
        contracts: form.contracts.map((c: any) => ({
          strike: c.strike,
          option_type: c.option_type,
          order_type: c.order_type,
          price: c.price,
          trigger_price: c.trigger_price,
        })),
        tgt: { type: { name: form.tgt_type }, value: form.tgt_value },
        sl: { type: { name: form.sl_type }, value: form.sl_value },
        tsl: { type: { name: form.tsl_type }, value: form.tsl_value },
      };
      if (!isNew) return tradeboardApi.updateTradeboard(payload);
      return tradeboardApi.addTradeboard(payload);
    },
    onSuccess: () => {
      notify.success(isNew ? "Tradeboard created" : "Tradeboard updated");
      navigate(`${basePath}/tradeboard`);
    },
  });

  // ── User/contract management ────────────────────────────────────────────────
  const addUser = () => {
    if (bas.length === 0) { notify.warn("No broker accounts available"); return; }
    const ba = bas[0];
    setForm((f) => ({
      ...f,
      users: [...f.users, { ba, broker_acc_id: ba._id, client_id: ba.params?.client_id, quantity: f.quantity }],
    }));
  };

  const deleteUser = (idx: number) => {
    setForm((f) => ({ ...f, users: f.users.filter((_, i) => i !== idx) }));
  };

  const addContract = () => {
    setForm((f) => ({ ...f, contracts: [...f.contracts, { strike: 0, option_type: "CE", order_type: "MKT", price: 0, trigger_price: 0 }] }));
  };

  const deleteContract = (idx: number) => {
    setForm((f) => ({ ...f, contracts: f.contracts.filter((_, i) => i !== idx) }));
  };

  // Gap-3: empty stubs (replicate as-is)
  const placeOrder = (_contract: any, _side: any) => {};
  const placeExitOrder = (_user: any, _position: any, _side: any) => {};
  const modifyOrder = (_order: any) => {};
  const cancelOrder = (_order: any) => {};
  const refreshDatas = () => {};

  return (
    <div>
      <PageHeader
        title={isNew ? "New Tradeboard" : `Edit: ${name}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`${basePath}/tradeboard`)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </>
        }
      />

      <TabbedView
        tabs={[
          {
            id: "settings",
            label: "Settings",
            content: (
              <div className="space-y-6">
                {/* Basic settings */}
                <Card>
                  <CardHeader><CardTitle>Basic</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} disabled={!isNew} />
                      </div>
                      <div className="space-y-1">
                        <Label>Symbol</Label>
                        <Select value={form.symbol} onValueChange={(v) => setForm((f) => ({ ...f, symbol: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SYMBOLS.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Product Type</Label>
                        <Select value={form.product_type} onValueChange={(v) => setForm((f) => ({ ...f, product_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRODUCT_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1 w-32">
                      <Label>Quantity (lot)</Label>
                      <Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
                    </div>
                  </CardContent>
                </Card>

                {/* Users */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Users / Broker Accounts</CardTitle>
                      <Button variant="outline" size="sm" onClick={addUser} className="gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add User
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {form.users.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No users added.</p>
                    ) : (
                      <div className="space-y-2">
                        {form.users.map((u, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 border rounded-lg">
                            <span className="text-sm flex-1">{u.client_id ?? "—"}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteUser(idx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contracts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Option Contracts</CardTitle>
                      <Button variant="outline" size="sm" onClick={addContract} className="gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add Contract
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {form.contracts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No contracts added.</p>
                    ) : (
                      <div className="space-y-2">
                        {form.contracts.map((c, idx) => (
                          <div key={idx} className="grid grid-cols-5 gap-2 items-center p-3 border rounded-lg">
                            <div>
                              <Label className="text-xs">Strike</Label>
                              <Input type="number" value={c.strike} onChange={(e) => {
                                const contracts = [...form.contracts];
                                contracts[idx] = { ...c, strike: Number(e.target.value) };
                                setForm((f) => ({ ...f, contracts }));
                              }} />
                            </div>
                            <div>
                              <Label className="text-xs">Option</Label>
                              <Select value={c.option_type} onValueChange={(v) => {
                                const contracts = [...form.contracts];
                                contracts[idx] = { ...c, option_type: v };
                                setForm((f) => ({ ...f, contracts }));
                              }}>
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {OPTION_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Order</Label>
                              <Select value={c.order_type} onValueChange={(v) => {
                                const contracts = [...form.contracts];
                                contracts[idx] = { ...c, order_type: v };
                                setForm((f) => ({ ...f, contracts }));
                              }}>
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {ORDER_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Price</Label>
                              <Input type="number" value={c.price} onChange={(e) => {
                                const contracts = [...form.contracts];
                                contracts[idx] = { ...c, price: Number(e.target.value) };
                                setForm((f) => ({ ...f, contracts }));
                              }} />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive justify-self-end" onClick={() => deleteContract(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Target / SL / TSL */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader><CardTitle>Target</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <Select value={form.tgt_type} onValueChange={(v) => setForm((f) => ({ ...f, tgt_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TGT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" value={form.tgt_value} onChange={(e) => setForm((f) => ({ ...f, tgt_value: Number(e.target.value) }))} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Stop Loss</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <Select value={form.sl_type} onValueChange={(v) => setForm((f) => ({ ...f, sl_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" value={form.sl_value} onChange={(e) => setForm((f) => ({ ...f, sl_value: Number(e.target.value) }))} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Trailing SL</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <Select value={form.tsl_type} onValueChange={(v) => setForm((f) => ({ ...f, tsl_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TSL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" value={form.tsl_value} onChange={(e) => setForm((f) => ({ ...f, tsl_value: Number(e.target.value) }))} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            id: "positions",
            label: "Positions",
            content: (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Positions tab — live positions per user. (Gap-3: order placement stubs not implemented.)
                </p>
                {form.users.map((u, idx) => (
                  <Card key={idx}>
                    <CardHeader><CardTitle className="text-base">{u.client_id ?? "User"}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">No live positions. Click "Load" to refresh (stub — refreshDatas is not implemented per Gap-3).</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
        ]}
        defaultTab="settings"
      />
    </div>
  );
}
