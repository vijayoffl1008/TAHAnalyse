import { ReactNode } from "react";
import { FormSchema, FormValues } from "../dynamic-form/types";

// ── EntityTable types ─────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface EntityTableColumn<T extends object> {
  /** Unique key for this column */
  key: string;
  header: string;
  /** Render cell content. If omitted, renders String(row[key]) */
  cell?: (row: T) => ReactNode;
  /** Allow sorting by this column */
  sortable?: boolean;
  /** CSS width class, e.g. "w-32" */
  width?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
}

export interface EntityAction<T extends object> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  /** Show action only when this returns true */
  visible?: (row: T) => boolean;
  /** Render as destructive (red) */
  destructive?: boolean;
}

export interface PaginationConfig {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  /** If provided, renders a page-size selector with these options */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

// ── CrudModal types ───────────────────────────────────────────────────────────

export interface CrudModalConfig {
  /** Title shown when adding */
  addTitle: string;
  /** Title shown when editing */
  editTitle: string;
  /** The DynamicForm schema used to render add/edit fields */
  schema: FormSchema;
  /** Width of the dialog, e.g. "max-w-2xl" */
  width?: string;
}
