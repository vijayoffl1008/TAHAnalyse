import { useFormContext } from "react-hook-form";
import { DynamicField } from "./DynamicField";
import { SectionDefinition, FormValues } from "./types";

interface Props {
  section: SectionDefinition;
  namePrefix?: string;
}

export function DynamicSection({ section, namePrefix = "" }: Props) {
  const { watch } = useFormContext();
  const watchValues = watch() as FormValues;

  // ── Visibility condition ──────────────────────────────────────────────────
  if (section.visible_when) {
    const { field, equals } = section.visible_when;
    if (watchValues[field] !== equals) {
      return null;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
        {section.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field) => (
          <DynamicField
            key={field.name}
            field={field}
            namePrefix={namePrefix}
            watchValues={watchValues}
          />
        ))}
      </div>
    </div>
  );
}
