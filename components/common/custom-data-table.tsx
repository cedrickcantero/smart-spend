"use client"

import React,{ useState, useEffect, useMemo, useCallback } from "react"
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { formatMoney } from "@/lib/utils"
import moment from "moment"

export type ColumnType = 
  | "text"
  | "number"
  | "money"
  | "date"
  | "boolean"
export interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: ColumnType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: any) => React.ReactNode
  hidden?: boolean
}

export interface BaseFilter {
  key: string
  label: string
}

export interface SelectFilter extends BaseFilter {
  type: "select"
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

export interface DateRangeFilter extends BaseFilter {
  type: "dateRange"
  value: DateRange | null
  dateRangeOnChange: (value: DateRange | null) => void
}

export type Filter = SelectFilter | DateRangeFilter

export interface Action {
  label: string
  icon?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (row: any) => void
}

export interface AddButton {
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

export interface ExportButton {
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

export interface DialogConfig {
  title: string
  description?: string
  content: React.ReactNode
  onConfirm: () => void
  confirmLabel?: string
  confirmIcon?: React.ReactNode
}

export interface SearchField {
  field: string
  type: "string" | "number"
  placeholder?: string
}

export interface CustomDataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  columns: Column[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions?: (row: any) => Action[]
  title?: string
  addButton?: AddButton
  searchField?: SearchField | SearchField[]
  filters?: Filter[]
  emptyMessage?: string
  className?: string
  initialItemsPerPage?: number
  initialSortConfig?: { key: string; direction: 'ascending' | 'descending' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (row: any) => void
  pagination?: {
    itemsPerPage: number;
    itemsPerPageOptions: number[];
  };
  modals?: {
    add?: React.ReactNode;
    edit?: React.ReactNode;
    [key: string]: React.ReactNode;  
  };
  selectable?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectionChange?: (selected: any[]) => void
  exportButton?: ExportButton
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedRows?: any[]
}

export function CustomDataTable({
  data,
  columns,
  actions = () => [],
  title,
  addButton,
  searchField,
  filters = [],
  emptyMessage = "No data found.",
  className = "",
  initialItemsPerPage = 10,
  initialSortConfig,
  onRowClick,
  pagination,
  modals,
  selectable = false,
  exportButton,
  selectedRows: externalSelectedRows,
  onSelectionChange,
}: CustomDataTableProps) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})
  const [searchInputValues, setSearchInputValues] = useState<Record<string, string>>({})
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState(initialSortConfig)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(pagination?.itemsPerPage || initialItemsPerPage)
  const [filteredData, setFilteredData] = useState(data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(Math.ceil(data.length / itemsPerPage))
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [internalSelectedRows, setInternalSelectedRows] = useState<any[]>([])
  const selectedRows = externalSelectedRows || internalSelectedRows;
  
  // Filter out hidden columns
  const visibleColumns = useMemo(() => {
    return columns.filter(column => !column.hidden);
  }, [columns]);
  
  // Ensure searchFields is always an array
  const searchFields = useMemo(() => {
    if (!searchField) return []
    return Array.isArray(searchField) ? searchField : [searchField]
  }, [searchField])

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    // Debounce time set to 300ms
    debounce((field: string, value: string) => {
      setSearchQueries(prev => ({
        ...prev,
        [field]: value
      }))
    }, 300),
    []
  )

  useEffect(() => {
    const initialFilterValues: Record<string, string> = {}
    filters.forEach((filter) => {
      initialFilterValues[filter.key] = "all"
    })
    setFilterValues(initialFilterValues)
  }, [filters])

  useEffect(() => {
    let result = [...data]

    if (Object.keys(searchQueries).length > 0 && searchFields.length > 0) {
      result = result.filter((item) => {
        return searchFields.every(searchField => {
          const query = searchQueries[searchField.field]?.toLowerCase() || '';
          if (!query) return true;
  
          // Support nested keys
          const keys = searchField.field.split('.');
          let value = item;
          for (const key of keys) {
            if (value === undefined || value === null) return false;
            value = value[key];
          }
  
          if (value === undefined || value === null) return false;
  
          if (searchField.type === "number") {
            // For number fields, try to match partial numbers
            const numValue = String(value);
            return numValue.includes(query);
          } else {
            // For string fields, do case-insensitive partial match
            return String(value).toLowerCase().includes(query);
          }
        });
      });
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== "all") {
        result = result.filter((item) => {
          // Support nested keys for filters
          const keys = key.split('.');
          let itemValue = item;
          for (const k of keys) {
            if (itemValue === undefined || itemValue === null) return false;
            itemValue = itemValue[k];
          }
          
          if (itemValue === undefined || itemValue === null) return false;
          
          if (value === "unassigned" || value === "none") {
            return !itemValue;
          }
          return String(itemValue) === value;
        });
      }
    })

    // Handle date range filtering
    const dateRangeFilter = filters.find(f => f.type === "dateRange")
    if (dateRangeFilter?.value) {
      const { from, to } = dateRangeFilter.value
      result = result.filter((item) => {
        // Get the date value from the item
        const dateValue = item[dateRangeFilter.key]
        
        // Convert to JavaScript Date object based on the type
        let itemDate: Date
        if (typeof dateValue === 'number') {
          // Handle Excel date serial numbers
          itemDate = new Date((dateValue - 25569) * 86400 * 1000)
        } else if (typeof dateValue === 'string') {
          // Handle ISO date strings
          itemDate = new Date(dateValue)
        } else {
          // If not a valid date format, skip this item
          return false
        }
        
        // Reset time part to midnight for date comparison
        itemDate.setHours(0, 0, 0, 0)
        
        if (from && to) {
          if (from.getTime() === to.getTime()) {
            return itemDate.getTime() === from.getTime()
          }
          // Otherwise filter for the date range
          return itemDate >= from && itemDate <= to
        } else if (from) {
          return itemDate >= from
        } else if (to) {
          return itemDate <= to
        }
        return true
      })
    }

    if (sortConfig) {
      result.sort((a, b) => {
        // Handle nested key sorting
        const keys = sortConfig.key.split('.');
        let aValue = a;
        let bValue = b;
        
        for (const key of keys) {
          if (aValue === undefined || aValue === null) break;
          aValue = aValue[key];
          
          if (bValue === undefined || bValue === null) break;
          bValue = bValue[key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [data, searchQueries, filterValues, sortConfig, searchFields, filters])

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    setTotalPages(totalPages || 1)

    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1)
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedData(filteredData.slice(startIndex, endIndex))
  }, [filteredData, itemsPerPage, currentPage])

  useEffect(() => {
    setInternalSelectedRows([])
  }, [filteredData, currentPage, itemsPerPage])

  const handleSearchInputChange = (field: string, value: string) => {
    // Update the input value immediately for UI responsiveness
    setSearchInputValues(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Debounce the actual search query update
    debouncedSearch(field, value)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setSearchQueries({})  // Reset all search queries
    const resetValues: Record<string, string> = {}
    filters.forEach((filter) => {
      if (filter.type === "select") {
        resetValues[filter.key] = "all"
      } else if (filter.type === "dateRange") {
        filter.dateRangeOnChange(null)
      }
    })
    setFilterValues(resetValues)
  }

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: "ascending" }
      }
      if (prevConfig.direction === "ascending") {
        return { key, direction: "descending" }
      }
      return undefined
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPageButtons = 5

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  // Get cell value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCellValue = (row: any, column: Column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
  
    // Support nested keys
    const keys = column.key.split('.');
    let value = row;
    for (const key of keys) {
      if (value === undefined || value === null) return null;
      value = value[key];
    }
  
    if (value === undefined || value === null) return null;
  
    switch (column.type) {
      case "number":
        return Number(value).toLocaleString();
      case "money":
        return formatMoney(value);
      case "date":
        if (typeof value === 'number') {
          // Handle Excel date serial numbers
          const date = new Date((value - 25569) * 86400 * 1000);
          return moment(date).format("MM/DD/YYYY");
        } else if (typeof value === 'string') {
          // Handle ISO date strings
          return moment(value).format("MM/DD/YYYY");
        }
        return value;
      case "boolean":
        return value ? "Yes" : "No";
      default:
        return value;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isRowSelected = (row: any) =>
    selectedRows.some((selected) => selected === row)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleRowSelection = (row: any) => {
    const isSelected = isRowSelected(row)
    const updated = isSelected
      ? selectedRows.filter((r) => r !== row)
      : [...selectedRows, row]
    
    if (externalSelectedRows) {
      if (onSelectionChange) {
        onSelectionChange(updated)
      }
    } else {
      setInternalSelectedRows(updated)
      if (onSelectionChange) {
        onSelectionChange(updated)
      }
    }
  }

  const toggleSelectAll = () => {
    const allSelected = paginatedData.every(row => selectedRows.includes(row))
    const updated = allSelected ? [] : [...paginatedData]
    
    if (externalSelectedRows) {
      if (onSelectionChange) {
        onSelectionChange(updated)
      }
    } else {
      setInternalSelectedRows(updated)
      if (onSelectionChange) {
        onSelectionChange(updated)
      }
    }
  }

  return (
    <div className={className}>
      {/* Filters and search */}
      {(searchFields.length > 0 || filters.length > 0) && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {searchFields.length > 0 && (
                <div className="flex flex-1 gap-4">
                  {searchFields.map((field) => (
                    <div key={field.field} className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`${field.placeholder || `Search by ${field.field}...`}`}
                        className="pl-8"
                        value={searchInputValues[field.field] || ''}
                        onChange={(e) => handleSearchInputChange(field.field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
              {filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Filter:</span>
                  </div>
                  {filters.map((filter) => (
                    filter.type === "dateRange" ? (
                      <DateRangePicker
                        key={filter.key}
                        value={filter.value}
                        onChange={filter.dateRangeOnChange || (() => {})}
                        className="w-[300px]"
                      />
                    ) : (
                      <Select
                        key={filter.key}
                        value={filterValues[filter.key]}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                      >
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {filter.label}</SelectItem>
                          {filter.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  ))}
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Title and add button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
        </div>
        <div>
          {addButton && (
            <Button onClick={addButton.onClick}>
              {addButton.icon && <span className="mr-2">{addButton.icon}</span>}
              {addButton.label}
            </Button>
          )}
          {exportButton && (
            <Button onClick={exportButton.onClick}>
              {exportButton.icon && <span className="mr-2">{exportButton.icon}</span>}
              {exportButton.label}
            </Button>
          )}
        </div>
      </div>

      {/* Render Modals */}
      {modals && Object.entries(modals).map(([key, modal]) => (
        <React.Fragment key={key}>
          {modal}
        </React.Fragment>
      ))}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={ paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row))} 
                    onCheckedChange={toggleSelectAll} 
                    aria-label="Select all claims" 
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortConfig && sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && (
                    <TableCell className="w-[40px]">
                       <Checkbox
                        checked={isRowSelected(row)}
                        onCheckedChange={() => {
                          toggleRowSelection(row)
                        }}
                        aria-label={`Select row ${row}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions(row).map((action, actionIndex) => (
                            <DropdownMenuItem 
                              key={actionIndex} 
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
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

      {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{paginatedData.length}</span> of{" "}
              <span className="font-medium">{filteredData.length}</span> items
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {pagination?.itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            {getPageNumbers().map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
        </div>
      </div>
    </div>
  )
}

// Helper function for debouncing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
