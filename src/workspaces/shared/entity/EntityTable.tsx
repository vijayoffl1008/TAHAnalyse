/**
 * EntityTable<T> — generic data table.
 *
 * Modes:
 *  - Client-side (default): search + sort + pagination all happen in-browser.
 *    Pass no `pagination` prop. Page-size selector is shown.
 *  - Server-side: pass a `pagination` prop with totalItems / currentPage /
 *    onPageChange (and optionally pageSizeOptions / onPageSizeChange).
 *    The table renders exactly the `data` slice you pass in.
 */

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityTableColumn, EntityAction, PaginationConfig, SortDirection } from "./types";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface Props<T extends object> {
  columns: EntityTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  /** Show a search input above the table */
  searchable?: boolean;
  /** Keys to search across — searches all string/number values if omitted */
  searchKeys?: (keyof T)[];
  /**
   * Server-side pagination config.
   * When omitted the table handles pagination client-side.
   */
  pagination?: PaginationConfig;
  /** Page-size options for the client-side selector (default 5/10/25/50) */
  pageSizeOptions?: number[];
  rowActions?: EntityAction<T>[];
  /** Key of each row — used for React keys */
  rowKey?: keyof T;
  emptyState?: React.ReactNode;
  className?: string;
}

export function EntityTable<T extends object>({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchKeys,
  pagination,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowActions,
  rowKey,
  emptyState,
  className,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // Client-side page state (ignored when server-side pagination prop is supplied)
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(pageSizeOptions[1] ?? 10);

  // ── Client-side search ────────────────────────────────────────────────────
  const safeData = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return safeData;
    const q = search.toLowerCase();
    return safeData.filter((row) => {
      const keys = searchKeys ?? (Object.keys(row as Record<string, unknown>) as (keyof T)[]);
      return keys.some((k) => {
        const v = (row as Record<string, unknown>)[k as string];
        return typeof v === "string"
          ? v.toLowerCase().includes(q)
          : typeof v === "number"
          ? String(v).includes(q)
          : false;
      });
    });
  }, [safeData, search, searchKeys]);

  // ── Client-side sort ──────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : (av as number) < (bv as number)
          ? -1
          : (av as number) > (bv as number)
          ? 1
          : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    // Reset to page 1 on sort change
    if (!pagination) setClientPage(1);
  };

  // ── Pagination bookkeeping ────────────────────────────────────────────────
  const isServerPaginated = !!pagination;

  const displayData = isServerPaginated
    ? sorted // server already sliced
    : sorted.slice(
        (clientPage - 1) * clientPageSize,
        clientPage * clientPageSize
      );

  const totalItems = isServerPaginated ? pagination.totalItems : sorted.length;
  const itemsPerPage = isServerPaginated ? pagination.itemsPerPage : clientPageSize;
  const currentPage = isServerPaginated ? pagination.currentPage : clientPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (isServerPaginated) {
      pagination.onPageChange(page);
    } else {
      setClientPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (isServerPaginated) {
      pagination.onPageSizeChange?.(size);
    } else {
      setClientPageSize(size);
      setClientPage(1);
    }
  };

  // Effective page-size options to show in the selector
  const effectivePageSizeOptions = isServerPaginated
    ? (pagination.pageSizeOptions ?? pageSizeOptions)
    : pageSizeOptions;

  const getRowKey = (row: T, idx: number): string => {
    if (rowKey) return String((row as Record<string, unknown>)[rowKey as string]);
    return String(idx);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {searchable && <Skeleton className="h-9 w-64" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search */}
      {searchable && (
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!pagination) setClientPage(1); // reset to p1 on search
            }}
            className="pl-8"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.width, col.hideOnMobile && "hidden sm:table-cell")}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              {rowActions && rowActions.length > 0 && (
                <TableHead className="w-12" />
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground"
                >
                  {emptyState ?? "No records found."}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, idx) => (
                <TableRow key={getRowKey(row, idx)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(col.hideOnMobile && "hidden sm:table-cell")}
                    >
                      {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </TableCell>
                  ))}

                  {/* Row actions */}
                  {rowActions && rowActions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions
                            .filter((a) => a.visible?.(row) !== false)
                            .map((action, ai) => (
                              <DropdownMenuItem
                                key={ai}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  action.destructive &&
                                    "text-destructive focus:text-destructive"
                                )}
                              >
                                {action.icon && (
                                  <span className="mr-2">
                                    {typeof action.icon === "function"
                                      ? (action.icon as any)(row)
                                      : action.icon}
                                  </span>
                                )}
                                {typeof action.label === "function"
                                  ? (action.label as any)(row)
                                  : action.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Page info + size selector */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => handlePageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {effectivePageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>
              {((currentPage - 1) * itemsPerPage) + 1}–
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2 text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
