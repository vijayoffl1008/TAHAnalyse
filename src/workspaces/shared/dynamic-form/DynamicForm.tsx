/**
 * DynamicForm — renders a complete form from a FormSchema.
 *
 * - Auto-generates Zod validation from field definitions (required, min, max)
 * - Integrates React Hook Form (Form provider)
 * - Renders sections via DynamicSection → DynamicField
 * - Exposes onSubmit callback with typed FormValues
 *
 * Usage:
 *   <DynamicForm
 *     schema={mySchema}
 *     defaultValues={existing}
 *     onSubmit={(values) => saveValues(values)}
 *     submitLabel="Save"
 *   />
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

import { DynamicSection } from "./DynamicSection";
import { FormSchema, FormValues, FieldDefinition } from "./types";

// ── Auto-generate Zod schema from field definitions ───────────────────────────

function buildZodField(field: FieldDefinition): z.ZodTypeAny {
  if (field.type === "boolean") return z.boolean().optional();
  if (field.type === "number") {
    let s = z.coerce.number();
    if (field.min !== undefined) s = s.min(field.min, `Min ${field.min}`);
    if (field.max !== undefined) s = s.max(field.max, `Max ${field.max}`);
    return field.required ? s : s.optional();
  }
  if (field.type === "multi-select") {
    return z.array(z.string()).optional();
  }
  if (field.type === "group" && field.sub_fields) {
    const subShape: z.ZodRawShape = {};
    for (const sub of field.sub_fields) subShape[sub.name] = buildZodField(sub);
    return z.object(subShape).optional();
  }
  // text / select / textarea / date
  const s = z.string();
  if (field.required) return s.min(1, `${field.label} is required`);
  return s.optional();
}

function buildZodSchema(schema: FormSchema): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      shape[field.name] = buildZodField(field);
    }
  }
  return z.object(shape);
}

// ── Build default values from schema ─────────────────────────────────────────

function buildDefaults(schema: FormSchema): FormValues {
  const defaults: FormValues = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else if (field.type === "boolean") {
        defaults[field.name] = false;
      } else if (field.type === "multi-select") {
        defaults[field.name] = [];
      } else if (field.type === "number") {
        defaults[field.name] = field.min ?? 0;
      } else {
        defaults[field.name] = "";
      }
    }
  }
  return defaults;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DynamicFormProps {
  schema: FormSchema;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Render submit button externally — don't render one inside the form */
  hideSubmit?: boolean;
  /** Called with the RHF submit handler so parent can trigger submission externally */
  onReady?: (submit: () => void) => void;
  namePrefix?: string;
}

export function DynamicForm({
  schema,
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
  hideSubmit = false,
  onReady,
  namePrefix = "",
}: DynamicFormProps) {
  const zodSchema = buildZodSchema(schema);
  const schemaDefaults = buildDefaults(schema);
  const merged = { ...schemaDefaults, ...(defaultValues ?? {}) };

  const form = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: merged,
  });

  // Reset form when defaultValues change (edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset({ ...schemaDefaults, ...defaultValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  // Expose submit handler to parent (for wizard step validation)
  useEffect(() => {
    if (onReady) {
      onReady(form.handleSubmit(onSubmit));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {schema.sections.map((section, idx) => (
          <div key={section.id}>
            {idx > 0 && <Separator className="my-4" />}
            <DynamicSection
              section={section}
              namePrefix={namePrefix}
            />
          </div>
        ))}

        {!hideSubmit && (
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
