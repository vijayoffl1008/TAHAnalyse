/**
 * UsersPage — admin user CRUD.
 * Ported from AlgoHopperBot users.component.
 *
 * Uses EntityPage for table + CRUD modal + confirm dialog.
 * Columns: Name, Email, Phone, Status (active/inactive).
 * Row actions: Edit, Activate/Deactivate, Delete.
 * Add modal: name, email, phone, subscription_upto, password.
 * Edit modal: name, email, phone, subscription_upto (no password).
 *
 * Fixes:
 * - Inc-6: pagination wired (though Angular never sent pagination params —
 *   listAccounts returns all users. If backend supports it, add params later.)
 * - Gap-5 pattern: ConfirmDialog uses direct onConfirm callback.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, UserCheck, UserX, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EntityTable,
  EntityPage,
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  type EntityTableColumn,
} from "@/workspaces/shared";
import {
  accountApi,
  type Account,
  type AddAccountDTO,
  type UpdateAccountDTO,
} from "@/services/api/account.api";
import { notify } from "@/workspaces/shared";
import { useAuth } from "@/contexts/AuthContext";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["accounts", page, pageSize],
    queryFn: () => accountApi.listAccounts({ page, page_size: pageSize }),
  });

  const accounts = accountsData?.accounts ?? [];
  const totalCount = accountsData?.total_count ?? 0;

  const addMutation = useMutation({
    mutationFn: accountApi.addAccount,
    onSuccess: () => {
      notify.success("User added successfully");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: accountApi.updateAccount,
    onSuccess: () => {
      notify.success("User updated successfully");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accountApi.deleteAccount,
    onSuccess: () => {
      notify.success("User deleted successfully");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: number }) =>
      accountApi.activateAccount(id, state),
    onSuccess: (_data, vars) => {
      notify.success(vars.state === 1 ? "User Activated" : "User Deactivated");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  // ── Local state ───────────────────────────────────────────────────────────
  const [editing, setEditing] = useState<Account | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    destructive: boolean;
    confirmLabel: string;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    destructive: false,
    confirmLabel: "Confirm",
  });

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: EntityTableColumn<Account>[] = [
    {
      key: "user.full_name",
      header: "Name",
      sortable: true,
      cell: (acc) => acc.user.full_name,
    },
    {
      key: "user.email",
      header: "Email",
      sortable: true,
      cell: (acc) => acc.user.email,
    },
    {
      key: "user.phone",
      header: "Phone",
      cell: (acc) => acc.user.phone,
    },
    {
      key: "state",
      header: "Status",
      cell: (acc) => {
        const isActive = acc.state === "active";
        return (
          <button
            type="button"
            onClick={() =>
              setConfirmState({
                open: true,
                title: isActive ? "Deactivate user?" : "Activate user?",
                description: `Are you sure you want to ${
                  isActive ? "deactivate" : "activate"
                } ${acc.user.full_name}?`,
                confirmLabel: isActive ? "Deactivate" : "Activate",
                destructive: isActive,
                onConfirm: async () => {
                  await activateMutation.mutateAsync({
                    id: acc._id,
                    state: isActive ? 0 : 1,
                  });
                  setConfirmState((s) => ({ ...s, open: false }));
                },
              })
            }
            className="inline-flex cursor-pointer hover:opacity-80"
            title={isActive ? "Click to deactivate" : "Click to activate"}
          >
            <StatusBadge status={isActive ? "active" : "inactive"} />
          </button>
        );
      },
    },
  ];

  // ── Row actions ────────────────────────────────────────────────────────────
  const rowActions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (acc: Account) => {
        openEdit(acc);
      },
    },
    {
      label: (acc: Account) =>
        acc.state === "active" ? "Deactivate" : "Activate",
      icon: (acc: Account) =>
        acc.state === "active" ? (
          <UserX className="h-4 w-4" />
        ) : (
          <UserCheck className="h-4 w-4" />
        ),
      onClick: (acc: Account) => {
        const activating = acc.state !== "active";
        setConfirmState({
          open: true,
          title: activating ? "Activate user?" : "Deactivate user?",
          description: `Are you sure you want to ${
            activating ? "activate" : "deactivate"
          } ${acc.user.full_name}?`,
          confirmLabel: activating ? "Activate" : "Deactivate",
          destructive: !activating,
          onConfirm: async () => {
            await activateMutation.mutateAsync({
              id: acc._id,
              state: activating ? 1 : 0,
            });
            setConfirmState((s) => ({ ...s, open: false }));
          },
        });
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      onClick: (acc: Account) => {
        setConfirmState({
          open: true,
          title: "Delete user?",
          description: `Are you sure you want to delete ${acc.user.full_name}? This action cannot be undone.`,
          confirmLabel: "Delete",
          destructive: true,
          onConfirm: async () => {
            await deleteMutation.mutateAsync(acc._id);
            setConfirmState((s) => ({ ...s, open: false }));
          },
        });
      },
    },
  ];

  // ── Add/Edit modal ─────────────────────────────────────────────────────────
  // Using a simple inline form (not CrudModal) since the fields differ between
  // add and edit modes (password only in add) and the payload shape is nested.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subscription_upto: "",
    password: "",
  });

  const openAdd = () => {
    setEditing(null);
    setFormData({ name: "", email: "", phone: "", subscription_upto: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setFormData({
      name: acc.user.full_name,
      email: acc.user.email,
      phone: acc.user.phone,
      subscription_upto: acc.subscription_upto ?? "",
      password: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      notify.error("Name, email, and phone are required.");
      return;
    }

    if (editing) {
      const payload: UpdateAccountDTO = {
        account_id: editing._id,
        user: {
          _id: editing.user._id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        subscription_upto: formData.subscription_upto,
      };
      await updateMutation.mutateAsync(payload);
      setShowModal(false);
    } else {
      if (!formData.password) {
        notify.error("Password is required when adding a user.");
        return;
      }
      const payload: AddAccountDTO = {
        user: {
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        subscription_upto: formData.subscription_upto,
      };
      await addMutation.mutateAsync(payload);
      setShowModal(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="User Accounts"
        description="Manage user accounts — add, edit, activate/deactivate, delete"
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={accounts}
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

      {/* Add/Edit Modal — inline (not CrudModal, due to nested payload + password-only-on-add) */}
      {showModal && (
        <UserModal
          open={showModal}
          onOpenChange={setShowModal}
          isEdit={!!editing}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          isSaving={addMutation.isPending || updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        destructive={confirmState.destructive}
        confirmLabel={confirmState.confirmLabel}
        isLoading={deleteMutation.isPending || activateMutation.isPending}
      />
    </div>
  );
}

// ── Inline modal (nested payload shape doesn't fit CrudModal/DynamicForm) ─────

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface UserModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isEdit: boolean;
  formData: typeof formData;
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
  onSave: () => void;
  isSaving: boolean;
}

function UserModal({
  open,
  onOpenChange,
  isEdit,
  formData,
  setFormData,
  onSave,
  isSaving,
}: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Subscription Upto</Label>
              <Input
                type="date"
                value={formData.subscription_upto}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    subscription_upto: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
