/**
 * TradeboardListPage — list of saved tradeboards.
 * Ported from AlgoHopperBot tradeboard-list.component.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
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
import { PageHeader, ConfirmDialog, notify } from "@/workspaces/shared";
import { tradeboardApi } from "@/services/api/tradeboard.api";

export function TradeboardListPage({ basePath }: { basePath: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: tradeboards = [], isLoading } = useQuery({
    queryKey: ["tradeboards"],
    queryFn: () => tradeboardApi.getAllTradeboards().then((r) => r.tradeboards),
  });

  const deleteMutation = useMutation({
    mutationFn: tradeboardApi.deleteTradeboard,
    onSuccess: () => {
      notify.success("Tradeboard deleted");
      qc.invalidateQueries({ queryKey: ["tradeboards"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Tradeboard"
        description="Manage manual order placement boards"
        actions={
          <Button onClick={() => navigate(`${basePath}/tradeboard/new`)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tradeboard
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradeboards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No tradeboards found.
                  </TableCell>
                </TableRow>
              ) : (
                tradeboards.map((tb: any) => (
                  <TableRow key={tb.name}>
                    <TableCell className="font-medium">{tb.name}</TableCell>
                    <TableCell>{tb.params?.symbol ?? "—"}</TableCell>
                    <TableCell>{tb.params?.product_type ?? "—"}</TableCell>
                    <TableCell>{tb.users?.length ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`${basePath}/tradeboard/${tb.name}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setConfirmDelete(tb.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete tradeboard?"
        description={`Are you sure you want to delete "${confirmDelete}"? This cannot be undone.`}
        onConfirm={async () => {
          if (confirmDelete) await deleteMutation.mutateAsync(confirmDelete);
          setConfirmDelete(null);
        }}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
