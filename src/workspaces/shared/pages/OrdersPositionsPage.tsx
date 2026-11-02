/**
 * OrdersPositionsPage — live orders + open positions.
 * Ported from AlgoHopperBot order-positions.component.
 *
 * Features:
 * - Admin: UserSelector + Load button
 * - Client: own user_id
 * - TabbedView: Orders tab + Positions tab
 * - Cancel order + close position with ConfirmDialog
 * - Gap-1: WebSocket disabled (no live updates — manual refresh only)
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { orderApiService } from "@/services/api/order.api";
import { positionApiService } from "@/services/api/order.api";
import { PageHeader, TabbedView, ConfirmDialog, notify, UserSelector, useAccounts } from "@/workspaces/shared";

export function OrdersPositionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("orders");
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const userId = isAdmin ? selectedUserId : user?.id ?? "";

  // ── Auto-select first user for admin ──────────────────────────────────────
  const { data: accounts = [] } = useAccounts();
  useEffect(() => {
    if (isAdmin && !selectedUserId && accounts.length > 0) {
      setSelectedUserId(accounts[0]._id);
    }
  }, [isAdmin, selectedUserId, accounts]);

  // ── Orders ──────────────────────────────────────────────────────────────
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", userId, activeTab, loadTrigger],
    queryFn: () => orderApiService.getOrders(userId),
    enabled: !!userId && activeTab === "orders" && loadTrigger > 0,
  });

  // ── Positions ────────────────────────────────────────────────────────────
  const { data: positionsData, isLoading: positionsLoading } = useQuery({
    queryKey: ["positions", userId, activeTab, loadTrigger],
    queryFn: () => positionApiService.getPositions(userId),
    enabled: !!userId && activeTab === "positions" && loadTrigger > 0,
  });

  // ── Parse orders ──────────────────────────────────────────────────────────
  const orders: any[] = [];
  let emsg = "";
  if (ordersData?.data) {
    if (ordersData.data[0]?.emsg === "") {
      ordersData.data.forEach((res) => {
        (res.orders ?? []).forEach((order: any) => {
          orders.push({
            bacc_id: order.bacc?._id,
            time: order.completed_time || order.entry_time,
            trading_symbol: order.trading_symbol,
            transaction_type: order.transaction_type,
            qty_filled: `${order.filled_qty}/${order.qty}`,
            product_type: order.product_type,
            price_trg_price: `${order.price}/${order.trigger_price}`,
            average_price: order.average_price,
            exchange: order.exchange,
            status: order.status,
          });
        });
      });
    } else {
      emsg = ordersData.data[0]?.emsg ?? "";
    }
  }

  // ── Parse positions ────────────────────────────────────────────────────────
  const positions: any[] = [];
  let positionsTotal = 0;
  let positionsEmsg = "";
  if (positionsData?.data) {
    if (positionsData.data[0]?.emsg === "") {
      positionsData.data.forEach((res) => {
        (res.positions ?? []).forEach((pos: any) => {
          positions.push({
            bacc_id: pos.bacc?._id,
            product_type: pos.product_type,
            trading_symbol: pos.trading_symbol,
            qty: pos.qty,
            exchange: pos.exchange,
            buy_avg_price: pos.buy_avg_price,
            sell_avg_price: pos.sell_avg_price,
            pnl: pos.pnl,
          });
          positionsTotal += parseFloat(String(pos.pnl || "0").replace(",", ""));
        });
      });
    } else {
      positionsEmsg = positionsData.data[0]?.emsg ?? "";
    }
  }

  // ── Cancel / Close handlers ────────────────────────────────────────────────
  const handleCancelOrder = async (order: any) => {
    try {
      await orderApiService.cancelOrder(userId, order.bacc_id, order);
      notify.success("Order cancelled successfully");
      setLoadTrigger((t) => t + 1);
    } catch {
      notify.error("Failed to cancel order");
    }
  };

  const handleClosePosition = async (pos: any) => {
    try {
      await positionApiService.closePosition(userId, pos.bacc_id, pos);
      notify.success("Position closed successfully");
      setLoadTrigger((t) => t + 1);
    } catch {
      notify.error("Failed to close position");
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders & Positions"
        description="View live orders and open positions"
        actions={
          <>
            {isAdmin && (
              <UserSelector
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                placeholder="Select user"
              />
            )}
            <Button onClick={() => setLoadTrigger((t) => t + 1)} disabled={!userId}>
              <Loader2 className="mr-2 h-4 w-4" />
              Load
            </Button>
          </>
        }
      />

      <TabbedView
        tabs={[
          {
            id: "orders",
            label: "Orders",
            content: (
              <div>
                {loadTrigger === 0 ? (
                  <p className="text-center py-12 text-muted-foreground text-sm">
                    Click "Load" to fetch orders.
                  </p>
                ) : ordersLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : emsg ? (
                  <Alert variant="destructive">
                    <AlertDescription>{emsg}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Price/Trigger</TableHead>
                          <TableHead>Avg Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                              No orders found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((o, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-sm">{o.time}</TableCell>
                              <TableCell className="font-medium">{o.trading_symbol}</TableCell>
                              <TableCell>{o.transaction_type}</TableCell>
                              <TableCell>{o.qty_filled}</TableCell>
                              <TableCell>{o.product_type}</TableCell>
                              <TableCell>{o.price_trg_price}</TableCell>
                              <TableCell>{o.average_price}</TableCell>
                              <TableCell>{o.status}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                  onClick={() => setConfirmState({
                                    open: true,
                                    title: "Cancel order?",
                                    description: "Are you sure you want to cancel this order?",
                                    onConfirm: async () => { await handleCancelOrder(o); setConfirmState((s) => ({ ...s, open: false })); },
                                  })}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "positions",
            label: "Positions",
            content: (
              <div>
                {loadTrigger === 0 ? (
                  <p className="text-center py-12 text-muted-foreground text-sm">
                    Click "Load" to fetch positions.
                  </p>
                ) : positionsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : positionsEmsg ? (
                  <Alert variant="destructive">
                    <AlertDescription>{positionsEmsg}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Buy Avg</TableHead>
                          <TableHead>Sell Avg</TableHead>
                          <TableHead>PnL</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                              No positions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {positions.map((p, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{p.trading_symbol}</TableCell>
                                <TableCell>{p.product_type}</TableCell>
                                <TableCell>{p.qty}</TableCell>
                                <TableCell>{p.buy_avg_price}</TableCell>
                                <TableCell>{p.sell_avg_price}</TableCell>
                                <TableCell className={parseFloat(String(p.pnl || "0").replace(",", "")) < 0 ? "text-destructive" : "text-success"}>
                                  {p.pnl}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                    onClick={() => setConfirmState({
                                      open: true,
                                      title: "Close position?",
                                      description: "Are you sure you want to close this position?",
                                      onConfirm: async () => { await handleClosePosition(p); setConfirmState((s) => ({ ...s, open: false })); },
                                    })}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Total PnL row */}
                            <TableRow className="border-t-2 font-semibold">
                              <TableCell colSpan={5} className="text-right">Total PnL</TableCell>
                              <TableCell className={positionsTotal < 0 ? "text-destructive" : "text-success"}>
                                {positionsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        defaultTab="orders"
        onTabChange={setActiveTab}
      />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => !o && setConfirmState((s) => ({ ...s, open: false }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        confirmLabel="Confirm"
      />
    </div>
  );
}
