/**
 * EntityPage<T> — full CRUD page wrapper.
 *
 * Composes: PageHeader + EntityTable + CrudModal + ConfirmDialog.
 * Reduces each entity page to ~50 lines of config (columns, schema, callbacks).
 */

import { useState, ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./PageHeader";
import { EntityTable } from "./EntityTable";
import { CrudModal } from "./CrudModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EntityTableColumn, EntityAction, PaginationConfig } from "./types";
import { FormSchema, FormValues } from "../dynamic-form/types";

interface Props<T extends Record<string, unknown>> {
  // ── Page ─────────────────────────────────────────────────────────────────
  title: string;
  description?: string;
  /** Extra action buttons in the page header (beside the Add button) */
  headerActions?: ReactNode;

  // ── Table ─────────────────────────────────────────────────────────────────
  columns: EntityTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey?: keyof T;
  searchable?: boolean;
  pagination?: PaginationConfig;
  /** Extra row actions appended after built-in Edit/Delete */
  extraRowActions?: EntityAction<T>[];
  emptyState?: ReactNode;

  // ── CRUD modal ────────────────────────────────────────────────────────────
  /** If omitted, no Add/Edit button is shown */
  crudSchema?: FormSchema;
  addTitle?: string;
  editTitle?: string;
  /** Convert a table row to DynamicForm default values (for edit mode) */
  toFormValues?: (item: T) => FormValues;
  onSave?: (values: FormValues, editing: T | null) => void | Promise<void>;
  /** Label for the Add button */
  addLabel?: string;
  /** Modal width */
  modalWidth?: string;

  // ── Delete ────────────────────────────────────────────────────────────────
  /** If provided, Delete action is added to row actions */
  onDelete?: (item: T) => void | Promise<void>;
  deleteTitle?: string;
  deleteDescription?: string;

  // ── Hide add button ───────────────────────────────────────────────────────
  hideAdd?: boolean;
}

export function EntityPage<T extends Record<string, unknown>>({
  title,
  description,
  headerActions,
  columns,
  data,
  isLoading,
  rowKey,
  searchable = true,
  pagination,
  extraRowActions = [],
  emptyState,
  crudSchema,
  addTitle = `Add ${title}`,
  editTitle = `Edit ${title}`,
  toFormValues,
  onSave,
  addLabel,
  modalWidth,
  onDelete,
  deleteTitle = "Delete item",
  deleteDescription = "This action cannot be undone.",
  hideAdd = false,
}: Props<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(deletingItem);
    } finally {
      setDeleting(false);
      setDeletingItem(null);
    }
  };

  // ── Row actions ───────────────────────────────────────────────────────────
  const rowActions: EntityAction<T>[] = [
    ...(crudSchema && onSave
      ? [{ label: "Edit", onClick: handleEdit }]
      : []),
    ...extraRowActions,
    ...(onDelete
      ? [
          {
            label: "Delete",
            destructive: true,
            onClick: (item: T) => setDeletingItem(item),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {headerActions}
            {crudSchema && onSave && !hideAdd && (
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                {addLabel ?? `Add ${title}`}
              </Button>
            )}
          </>
        }
      />

      <EntityTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={rowKey}
        searchable={searchable}
        pagination={pagination}
        rowActions={rowActions.length > 0 ? rowActions : undefined}
        emptyState={emptyState}
      />

      {crudSchema && onSave && (
        <CrudModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editingItem={editingItem}
          addTitle={addTitle}
          editTitle={editTitle}
          schema={crudSchema}
          toFormValues={toFormValues}
          onSave={onSave}
          width={modalWidth}
        />
      )}

      {onDelete && (
        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(o) => !o && setDeletingItem(null)}
          title={deleteTitle}
          description={deleteDescription}
          onConfirm={handleDelete}
          isLoading={deleting}
          destructive
        />
      )}
    </div>
  );
}
