/**
 * ThreadPage — strategy execution management.
 * Ported from AlgoHopperBot thread.component.
 *
 * Features:
 * - Admin: UserSelector to pick which user's threads to show
 * - Client: shows own threads (acc_id from user.id)
 * - Start/stop toggle (GET thread/start/|thread/stop/ with tid param)
 * - Enable/disable toggle via Switch + confirmation dialog
 * - Inline display-name edit (POST thread/dname/ with {tid, display_name})
 * - Delete (GET thread/delete/ with tid param)
 * - Restart (Inc-10 fix): stop then start
 * - Client-side pagination with selectable page size
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Square,
  Trash2,
  RotateCw,
  Edit3,
  Check,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { threadApi } from "@/services/api/thread.api";
import { toThreadRow } from "@/lib/strategy-helper";
import { UserSelector, useAccounts } from "@/workspaces/shared";
import { StatusBadge, PageHeader, ConfirmDialog, notify } from "@/workspaces/shared";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export function ThreadPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    destructive: boolean;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "Confirm", destructive: false, onConfirm: () => {} });

  const accId = isAdmin ? selectedUserId : user?.id ?? "";

  // ── Auto-select first user for admin ──────────────────────────────────────
  const { data: accounts = [] } = useAccounts();
  useEffect(() => {
    if (isAdmin && !selectedUserId && accounts.length > 0) {
      setSelectedUserId(accounts[0]._id);
    }
  }, [isAdmin, selectedUserId, accounts]);

  // Reset to page 1 when user/pageSize changes
  useEffect(() => { setPage(1); }, [accId, pageSize]);

  // ── Data — true server-side pagination ──────────────────────────────────
  const { data: threadResponse, isLoading } = useQuery({
    queryKey: ["threads", accId, page, pageSize],
    queryFn: () =>
      threadApi.list({
        count_per_page: pageSize,
        page_num: page,
        acc_id: accId,
        display_for: "web_main_list",
      }),
    enabled: !!accId,
    refetchInterval: 5000,
  });

  const threads = (threadResponse?.threads ?? []).map(toThreadRow);
  const totalItems = threadResponse?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // ── Mutations ─────────────────────────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: (tid: string) => threadApi.start(tid),
    onSuccess: () => {
      notify.success("Started successfully");
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: (tid: string) => threadApi.stop(tid),
    onSuccess: () => {
      notify.success("Stopped successfully");
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tid: string) => threadApi.deleteThread(tid),
    onSuccess: () => {
      notify.success("Deleted successfully");
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ tid, action }: { tid: string; action: "enable" | "disable" }) =>
      threadApi.action(tid, action),
    onSuccess: (_d, vars) => {
      notify.success(`Strategy ${vars.action === "enable" ? "Enabled" : "Disabled"} Successfully`);
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    },
  });

  const dnameMutation = useMutation({
    mutationFn: ({ tid, name }: { tid: string; name: string }) =>
      threadApi.updateDName(tid, name),
    onSuccess: () => {
      notify.success("Display name updated");
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    },
  });

  // ── Restart (Inc-10 fix): stop then start ──────────────────────────────────
  const handleRestart = async (tid: string) => {
    notify.info("Restarting strategy...");
    try {
      await threadApi.stop(tid);
      await new Promise((r) => setTimeout(r, 1000));
      await threadApi.start(tid);
      notify.success("Restarted successfully");
      qc.invalidateQueries({ queryKey: ["threads", accId] });
    } catch {
      notify.error("Failed to restart strategy");
    }
  };

  // ── Inline edit ─────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const startEdit = (row: (typeof threads)[0]) => {
    setEditingId(row.id);
    setEditText(row.strategy_name);
  };

  const saveEdit = async (tid: string) => {
    await dnameMutation.mutateAsync({ tid, name: editText });
    setEditingId(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Strategy Execution"
        description="Manage running strategy instances"
        actions={
          isAdmin ? (
            <UserSelector
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              placeholder="Select user"
            />
          ) : undefined
        }
      />

      {isLoading || !accId ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No strategy instances found.
                    </TableCell>
                  </TableRow>
                ) : (
                  threads.map((row) => (
                    <TableRow key={row.id}>
                      {/* Name with inline edit */}
                      <TableCell>
                        {editingId === row.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="h-7 w-40"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(row.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(row.id)}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{row.strategy_name}</span>
                        )}
                      </TableCell>
                      <TableCell>{row.symbol ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.broker || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.state} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.entry_exit_time || "—"}</TableCell>

                      {/* Enable/Disable switch */}
                      <TableCell className="text-center">
                        <Switch
                          checked={row.enabled}
                          onCheckedChange={() =>
                            setConfirmState({
                              open: true,
                              title: row.enabled ? "Disable strategy?" : "Enable strategy?",
                              description: `Are you sure you want to ${row.enabled ? "disable" : "enable"} "${row.strategy_name}"?`,
                              confirmLabel: row.enabled ? "Disable" : "Enable",
                              destructive: row.enabled,
                              onConfirm: async () => {
                                await actionMutation.mutateAsync({
                                  tid: row.id,
                                  action: row.enabled ? "disable" : "enable",
                                });
                                setConfirmState((s) => ({ ...s, open: false }));
                              },
                            })
                          }
                          disabled={actionMutation.isPending}
                        />
                      </TableCell>

                      {/* Row actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Start/Stop toggle */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (row.state === "stopped") {
                                startMutation.mutate(row.id);
                              } else {
                                stopMutation.mutate(row.id);
                              }
                            }}
                            disabled={startMutation.isPending || stopMutation.isPending}
                            title={row.state === "stopped" ? "Start" : "Stop"}
                          >
                            {row.state === "stopped" ? (
                              <Play className="h-4 w-4 text-success" />
                            ) : (
                              <Square className="h-4 w-4 text-destructive" />
                            )}
                          </Button>

                          {/* More actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(row)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRestart(row.id)}>
                                <RotateCw className="mr-2 h-4 w-4" />
                                Restart
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setConfirmState({
                                    open: true,
                                    title: "Delete strategy instance?",
                                    description: `Are you sure you want to delete "${row.strategy_name}"? This cannot be undone.`,
                                    confirmLabel: "Delete",
                                    destructive: true,
                                    onConfirm: async () => {
                                      await deleteMutation.mutateAsync(row.id);
                                      setConfirmState((s) => ({ ...s, open: false }));
                                    },
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination footer */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page <= 1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => !o && setConfirmState((s) => ({ ...s, open: false }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        isLoading={deleteMutation.isPending || actionMutation.isPending}
      />
    </div>
  );
}
