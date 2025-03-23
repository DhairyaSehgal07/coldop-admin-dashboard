"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showColumnFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  getRowNavigationLink?: (row: TData) => string;
  className?: string;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  title?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showColumnFilters = true,
  showPagination = true,
  pageSize = 100, // Changed default to 100
  className = "",
  onRowClick,
  emptyMessage = "No results found.",
  isLoading = false,
  title,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100, // Set initial state to 100
  });

  // Update pageSize if the prop changes
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: pageSize,
    }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-lg ${className}`}>
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        {title && (
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        )}

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {showColumnFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border border-gray-300 bg-white hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white rounded-md shadow-lg"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-sm text-gray-700 hover:bg-gray-50"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table with sticky header */}
      <div className="relative overflow-hidden">
        {/* Unified scrollable container for both header and body */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-[calc(100vh-18rem)] max-h-96 overflow-y-auto">
          <table className="w-full divide-y divide-gray-200 min-w-[640px]">
            <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="group px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex flex-col space-y-2">
                          <div
                            className={`flex items-center justify-between ${
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
                          </div>
                          {header.column.getCanFilter() &&
                            header.column.getIsVisible() && (
                              <Input
                                placeholder={`Filter ${header.column.id}`}
                                value={
                                  (header.column.getFilterValue() as string) ??
                                  ""
                                }
                                onChange={(event) =>
                                  header.column.setFilterValue(
                                    event.target.value
                                  )
                                }
                                className="w-full text-xs px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick && onRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-700 break-words"
                        style={{ width: cell.column.getSize() }}
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
                    className="px-6 py-12 text-center text-gray-500 text-sm border-t border-gray-200"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-gray-500 text-lg mb-1">
                        {emptyMessage}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Bottom padding div */}
          <div className="h-16"></div>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && table.getPageCount() > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
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
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

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
                    <Button
                      key={pageNumber}
                      variant={pageNumber === pageIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pageIndex
                          ? "z-10 bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber + 1}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Prev</span>
            </Button>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
