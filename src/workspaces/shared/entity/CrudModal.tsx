/**
 * CrudModal — generic add/edit dialog backed by DynamicForm.
 *
 * Replaces Angular Bootstrap modals + jQuery show/hide.
 * Uses shadcn Dialog + DynamicForm (RHF + auto-Zod).
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DynamicForm } from "../dynamic-form/DynamicForm";
import { FormSchema, FormValues } from "../dynamic-form/types";
import { cn } from "@/lib/utils";

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = add mode, non-null = edit mode */
  editingItem: T | null;
  addTitle: string;
  editTitle: string;
  schema: FormSchema;
  /** Map the editing item to DynamicForm default values */
  toFormValues?: (item: T) => FormValues;
  onSave: (values: FormValues, editingItem: T | null) => void | Promise<void>;
  saveLabel?: string;
  /** Dialog max-width Tailwind class, e.g. "max-w-2xl" */
  width?: string;
}

export function CrudModal<T>({
  open,
  onOpenChange,
  editingItem,
  addTitle,
  editTitle,
  schema,
  toFormValues,
  onSave,
  saveLabel = "Save",
  width = "max-w-xl",
}: Props<T>) {
  const [saving, setSaving] = useState(false);
  // Holds the submit trigger from DynamicForm
  const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);

  const title = editingItem ? editTitle : addTitle;
  const defaultValues = editingItem && toFormValues
    ? toFormValues(editingItem)
    : undefined;

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      await onSave(values, editingItem);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className={cn("overflow-y-auto max-h-[90vh]", width)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <DynamicForm
            schema={schema}
            defaultValues={defaultValues}
            onSubmit={handleSave}
            hideSubmit
            isSubmitting={saving}
            onReady={(fn) => setSubmitFn(() => fn)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitFn?.()}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
