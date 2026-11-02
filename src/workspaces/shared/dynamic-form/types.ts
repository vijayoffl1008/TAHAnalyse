/**
 * Schema types for the DynamicForm system.
 *
 * A FieldDefinition describes a single form input.
 * A SectionDefinition groups fields under a title.
 * A FormSchema is an array of sections.
 *
 * The DynamicForm renders any schema without writing new React code —
 * this is the foundation for AI-generated strategy configs.
 */

// ── Field types ───────────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "boolean"
  | "textarea"
  | "date"
  | "group"; // nested sub-fields rendered as a row

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

/** Loads options from a live API endpoint via TanStack Query */
export interface OptionsSource {
  /** API path relative to faqApi base, e.g. 'symbol/exchanges/' */
  api: string;
  /** Static params + dynamic refs: "$fieldName" reads from sibling field value */
  params?: Record<string, string>;
  /** Path to label in response item, e.g. 'name' */
  labelKey?: string;
  /** Path to value in response item, e.g. '_id' */
  valueKey?: string;
}

export interface FieldDefinition {
  /** Unique key within the form — used as form field name */
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  /** For number fields */
  min?: number;
  max?: number;
  step?: number;
  /** For select / multi-select — static options */
  options?: SelectOption[];
  /** For select / multi-select — dynamic options from API */
  options_source?: OptionsSource;
  /** For group type — nested fields rendered in a row */
  sub_fields?: FieldDefinition[];
  /** Additional Tailwind classes on the field wrapper */
  className?: string;
  disabled?: boolean;
  /** Help text shown below the input */
  description?: string;
}

// ── Section types ─────────────────────────────────────────────────────────────

/** Show/hide this section based on another field's value */
export interface VisibilityCondition {
  /** field name to watch */
  field: string;
  /** show when the watched field equals this value */
  equals: string | number | boolean;
}

export interface SectionDefinition {
  id: string;
  title: string;
  /** Optional description shown below the title */
  description?: string;
  fields: FieldDefinition[];
  /** When set, the section is hidden unless the condition is met */
  visible_when?: VisibilityCondition;
}

// ── Form schema ───────────────────────────────────────────────────────────────

export interface FormSchema {
  sections: SectionDefinition[];
}

// ── Runtime value map ─────────────────────────────────────────────────────────

/** The flat key→value map that DynamicForm manages */
export type FormValues = Record<string, unknown>;
