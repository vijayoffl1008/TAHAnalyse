import { useQuery } from "@tanstack/react-query";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { faqApi } from "@/services/api/clients";
import { FieldDefinition, SelectOption } from "./types";

interface Props {
  field: FieldDefinition;
  /** Name prefix for nested fields, e.g. "settings." */
  namePrefix?: string;
  /** Current form values — used to resolve $fieldName params in options_source */
  watchValues?: Record<string, unknown>;
}

export function DynamicField({ field, namePrefix = "", watchValues }: Props) {
  const fullName = `${namePrefix}${field.name}`;
  const { control } = useFormContext();

  // ── Dynamic options via TanStack Query ───────────────────────────────────
  const dynamicEnabled = !!field.options_source;
  const resolvedParams: Record<string, string> = {};
  if (field.options_source?.params) {
    for (const [k, v] of Object.entries(field.options_source.params)) {
      resolvedParams[k] =
        v.startsWith("$")
          ? String(watchValues?.[v.slice(1)] ?? "")
          : v;
    }
  }

  const { data: dynamicData, isLoading: dynLoading } = useQuery({
    queryKey: ["dynamic-options", field.options_source?.api, resolvedParams],
    queryFn: async () => {
      const res = await faqApi.get(field.options_source!.api, {
        params: resolvedParams,
      });
      return res.data;
    },
    enabled: dynamicEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const resolvedOptions: SelectOption[] = dynamicEnabled
    ? (dynamicData?.items ?? dynamicData ?? []).map((item: Record<string,unknown>) => ({
        label: String(item[field.options_source?.labelKey ?? "name"] ?? item),
        value: item[field.options_source?.valueKey ?? "_id"] as string | number,
      }))
    : field.options ?? [];

  // ── group type ────────────────────────────────────────────────────────────
  if (field.type === "group" && field.sub_fields) {
    return (
      <div className={cn("space-y-1", field.className)}>
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        <div className="flex gap-3 flex-wrap">
          {field.sub_fields.map((sub) => (
            <DynamicField
              key={sub.name}
              field={sub}
              namePrefix={`${fullName}.`}
              watchValues={watchValues}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <FormField
      control={control}
      name={fullName}
      render={({ field: rhfField }) => (
        <FormItem className={cn("space-y-1", field.className)}>
          {field.type !== "boolean" && (
            <FormLabel>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            <>
              {/* ── text ── */}
              {field.type === "text" && (
                <Input
                  {...rhfField}
                  value={String(rhfField.value ?? "")}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                />
              )}

              {/* ── number ── */}
              {field.type === "number" && (
                <Input
                  {...rhfField}
                  type="number"
                  value={rhfField.value === undefined ? "" : String(rhfField.value)}
                  onChange={(e) => rhfField.onChange(e.target.valueAsNumber)}
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                />
              )}

              {/* ── textarea ── */}
              {field.type === "textarea" && (
                <Textarea
                  {...rhfField}
                  value={String(rhfField.value ?? "")}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  rows={3}
                />
              )}

              {/* ── boolean (switch) ── */}
              {field.type === "boolean" && (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!rhfField.value}
                    onCheckedChange={rhfField.onChange}
                    disabled={field.disabled}
                    id={`switch-${fullName}`}
                  />
                  <label
                    htmlFor={`switch-${fullName}`}
                    className="text-sm font-medium cursor-pointer select-none"
                  >
                    {field.label}
                  </label>
                </div>
              )}

              {/* ── select ── */}
              {field.type === "select" && (
                <>
                  {dynLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={String(rhfField.value ?? "")}
                      onValueChange={rhfField.onChange}
                      disabled={field.disabled}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.placeholder ?? `Select ${field.label}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {resolvedOptions.map((opt) => (
                          <SelectItem
                            key={String(opt.value)}
                            value={String(opt.value)}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}

              {/* ── multi-select (comma-separated values in a Select for now) ── */}
              {field.type === "multi-select" && (
                <>
                  {dynLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={
                        Array.isArray(rhfField.value)
                          ? (rhfField.value as string[])[0] ?? ""
                          : String(rhfField.value ?? "")
                      }
                      onValueChange={(v) =>
                        rhfField.onChange(
                          Array.isArray(rhfField.value)
                            ? [...(rhfField.value as string[]), v]
                            : [v]
                        )
                      }
                      disabled={field.disabled}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.placeholder ?? `Select ${field.label}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {resolvedOptions.map((opt) => (
                          <SelectItem
                            key={String(opt.value)}
                            value={String(opt.value)}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </>
          </FormControl>

          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
