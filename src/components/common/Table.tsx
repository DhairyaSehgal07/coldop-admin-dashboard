/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Column,
} from "@tanstack/react-table";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { rankItem } from "@tanstack/match-sorter-utils";

// Define column metadata interface for specifying filter types
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    valueType?: TValue;
    filterVariant?: "text" | "range" | "select";
    selectOptions?: Array<{ value: string; label: string }>;
  }
}

// Global fuzzy filter function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const cellValue = row.getValue(columnId);
  if (cellValue === null || cellValue === undefined) return true;

  const itemRank = rankItem(
    String(cellValue).toLowerCase(),
    String(value).toLowerCase()
  );

  addMeta({ itemRank });
  return itemRank.passed;
};

// Table props interface
interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  showColumnFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  // Add missing properties that were used in IncomingOrdersTab
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// Filter component for individual columns
function ColumnFilter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, selectOptions = [] } = column.columnDef.meta ?? {};

  // Range filter (for numeric columns)
  if (filterVariant === "range") {
    return (
      <div className="pt-2">
        <div className="flex items-center space-x-2">
          <DebouncedInput
            type="number"
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder="Min"
            className="w-24 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <DebouncedInput
            type="number"
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
            placeholder="Max"
            className="w-24 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    );
  }

  // Select filter (for enum/categorical columns)
  if (filterVariant === "select") {
    return (
      <div className="pt-2">
        <select
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All</option>
          {/* Use provided select options or fallback to defaults */}
          {selectOptions.length > 0
            ? selectOptions.map((option: { value: string; label: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : ["option1", "option2", "option3"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
        </select>
      </div>
    );
  }

  // Default text filter
  return (
    <div className="pt-2">
      <DebouncedInput
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Filter..."
        className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

// Debounced input component to prevent excessive filtering
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Main Table component
const Table = <T extends object>(props: DataTableProps<T>) => {
  const {
    data,
    columns,
    searchPlaceholder = "Search...",
    showSearch,
    showColumnFilters = true,
    showPagination = true,
    pageSize = 100, // Default to 100 items per page as requested
    className = "",
    onRowClick,
    emptyMessage = "No data available",
    isLoading = false,
    globalFilter: externalGlobalFilter,
    setGlobalFilter: externalSetGlobalFilter,
  } = props;
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Set initial pagination state with specified pageSize
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize, // Use the prop value or default to 100
  });

  // Update pageSize if the prop changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: pageSize,
    }));
  }, [pageSize]);
  
  // Handle external pagination control if provided
  useEffect(() => {
    const { currentPage } = props;
    if (currentPage !== undefined) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: currentPage || 0,
      }));
    }
  }, [props.currentPage, props]);  // Include props as dependency

  // Determine whether to use internal or external state for global filter
  const globalFilter =
    externalGlobalFilter !== undefined
      ? externalGlobalFilter
      : internalGlobalFilter;
  const setGlobalFilter = externalSetGlobalFilter || setInternalGlobalFilter;

  // Sync internal state with external state when provided
  useEffect(() => {
    if (externalGlobalFilter !== undefined) {
      setInternalGlobalFilter(externalGlobalFilter);
    }
  }, [externalGlobalFilter]);
  
  // Notify parent component of page changes if callback is provided
  useEffect(() => {
    const { onPageChange } = props;
    if (onPageChange) {
      onPageChange(pagination.pageIndex);
    }
  }, [pagination.pageIndex, props, props.onPageChange]);  // Include all dependencies

  // Memoize data to prevent unnecessary re-renders
  const tableData = useMemo(() => data, [data]);
  const tableColumns = useMemo(() => columns, [columns]);

  // Initialize the table with memoized props to maintain stable references
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // Set to true if you're handling pagination manually
    debugTable: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Global Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={`flex items-center ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />) : null}
                        </div>

                        {/* Column Filters */}
                        {showColumnFilters && header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row.original as T)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && table.getPageCount() > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getPrePaginationRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {table.getPrePaginationRowModel().rows.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {Array.from(
                  Array(Math.min(table.getPageCount(), 5)).keys()
                ).map((_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  // Show 2 pages before and after current page
                  let pageNumber: number;
                  if (table.getPageCount() <= 5) {
                    pageNumber = i;
                  } else if (pageIndex < 3) {
                    pageNumber = i;
                  } else if (pageIndex >= table.getPageCount() - 3) {
                    pageNumber = table.getPageCount() - 5 + i;
                  } else {
                    pageNumber = pageIndex - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => table.setPageIndex(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pageIndex
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
export type { DataTableProps };
