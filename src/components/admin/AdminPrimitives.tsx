import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  AlertTriangle, 
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Check
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// 1. ADMIN CARD (SINGLE-SHELL)
// ==========================================
interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  topAccent?: boolean;
  accentColor?: string;
}

export function AdminCard({ 
  children, 
  className = '', 
  topAccent = false,
  accentColor = '#000000'
}: AdminCardProps) {
  const style = topAccent ? { borderTop: `4px solid ${accentColor}` } : undefined;
  return (
    <div 
      className={`admin-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[#1A5C5E] ${className} ${topAccent ? 'has-accent' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ==========================================
// 2. ADMIN STAT CARD
// ==========================================
interface AdminStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function AdminStatCard({
  label,
  value,
  subtext,
  icon,
  actionUrl,
  actionLabel,
  trend
}: AdminStatCardProps) {
  const CardContent = (
    <div className="admin-stat-card-body">
      <div className="admin-stat-card-header">
        <span className="admin-stat-card-label">{label}</span>
        <div className="admin-stat-card-icon">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="admin-stat-card-value font-mono text-xl font-bold">{value}</div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            trend.isPositive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {trend.isPositive !== false ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}</span>
          </span>
        )}
      </div>
      {subtext && <p className="admin-stat-card-subtext">{subtext}</p>}
      {actionUrl && actionLabel && (
        <span className="admin-stat-card-action">
          {actionLabel} <ArrowRight className="w-3 h-3 inline" />
        </span>
      )}
    </div>
  );

  return (
    <AdminCard className="admin-stat-card">
      {actionUrl ? (
        <Link href={actionUrl} className="admin-stat-card-link">
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </AdminCard>
  );
}

// ==========================================
// 3. ADMIN STATUS BADGE
// ==========================================
interface AdminStatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}

export function AdminStatusBadge({ status, type }: AdminStatusBadgeProps) {
  let variant: "success" | "warning" | "destructive" | "secondary" | "gold" = "secondary";
  
  const s = status.toLowerCase();
  if (s === 'active' || s === 'paid' || s === 'resolved' || s === 'approved' || s === 'delivered' || s === 'completed' || s === 'published' || s === 'new') {
    variant = "success";
  } else if (s === 'draft' || s === 'pending' || s === 'cod_pending' || s === 'under_review' || s === 'preparing' || s === 'investigating' || s === 'issued' || s === 'shipped') {
    variant = "warning";
  } else if (s === 'failed' || s === 'cancelled' || s === 'rejected' || s === 'critical') {
    variant = "destructive";
  } else if (s === 'archived' || s === 'contacted' || s === 'in_transit') {
    variant = "gold";
  }

  return (
    <Badge variant={variant} className="gap-1.5 uppercase text-[10px]">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{status.replace('_', ' ')}</span>
    </Badge>
  );
}

// ==========================================
// 4. ADMIN DATA TABLE (DESKTOP WITH SORTING)
// ==========================================
// ==========================================
// 4. ADMIN DATA TABLE (DESKTOP WITH SORTING, PERSISTENCE, SELECTION & CSV EXPORT)
// ==========================================
interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: keyof T | ((item: T) => any);
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  storageKey?: string;
  enableSelection?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  enableColumnVisibility?: boolean;
  enableCSVExport?: boolean;
  csvFileName?: string;
  tableName?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  storageKey,
  enableSelection = false,
  selectedRows = [],
  onSelectionChange,
  enableColumnVisibility = false,
  enableCSVExport = false,
  csvFileName = 'table-export',
  tableName = 'data table'
}: AdminDataTableProps<T>) {
  const [sortColIndex, setSortColIndex] = React.useState<number | null>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = sessionStorage.getItem(`${storageKey}_sortColIndex`);
      return saved !== null ? Number(saved) : null;
    }
    return null;
  });

  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = sessionStorage.getItem(`${storageKey}_sortDirection`);
      return (saved as 'asc' | 'desc') || 'asc';
    }
    return 'asc';
  });

  const [visibleColumns, setVisibleColumns] = React.useState<boolean[]>(() => {
    return columns.map(() => true);
  });

  const [isColMenuOpen, setIsColMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (storageKey) {
      if (sortColIndex !== null) {
        sessionStorage.setItem(`${storageKey}_sortColIndex`, String(sortColIndex));
      } else {
        sessionStorage.removeItem(`${storageKey}_sortColIndex`);
      }
      sessionStorage.setItem(`${storageKey}_sortDirection`, sortDirection);
    }
  }, [sortColIndex, sortDirection, storageKey]);

  const announceChange = (msg: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin-announce', { detail: msg }));
    }
  };

  const handleHeaderClick = (idx: number, col: Column<T>) => {
    if (!col.sortable || !col.sortKey) return;

    if (sortColIndex === idx) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
        announceChange(`Sorted table by ${col.header} descending`);
      } else {
        setSortColIndex(null);
        setSortDirection('asc');
        announceChange(`Cleared sort on table`);
      }
    } else {
      setSortColIndex(idx);
      setSortDirection('asc');
      announceChange(`Sorted table by ${col.header} ascending`);
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortColIndex === null) return data;
    const col = columns[sortColIndex];
    if (!col || !col.sortKey) return data;

    const getValue = (item: T) => {
      if (typeof col.sortKey === 'function') {
        return col.sortKey(item);
      }
      return item[col.sortKey as keyof T];
    };

    return [...data].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const compareRes = valA < valB ? -1 : 1;
      return sortDirection === 'asc' ? compareRes : -compareRes;
    });
  }, [data, columns, sortColIndex, sortDirection]);

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...data]);
      announceChange(`Selected all ${data.length} rows`);
    } else {
      onSelectionChange([]);
      announceChange(`Deselected all rows`);
    }
  };

  const handleSelectRow = (item: T, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, item]);
      announceChange(`Selected 1 row`);
    } else {
      onSelectionChange(selectedRows.filter(r => keyExtractor(r) !== keyExtractor(item)));
      announceChange(`Deselected 1 row`);
    }
  };

  const handleExportCSV = () => {
    const visibleCols = columns.filter((_, idx) => visibleColumns[idx]);
    const headers = visibleCols.map(c => c.header).join(',');
    
    const rows = data.map(item => {
      return visibleCols.map(col => {
        let val = '';
        if (col.sortKey && typeof col.sortKey === 'string') {
          val = String(item[col.sortKey as keyof T] || '');
        } else if (typeof col.sortKey === 'function') {
          val = String(col.sortKey(item) || '');
        } else {
          val = col.header;
        }
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${csvFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    announceChange(`Exported ${data.length} rows as CSV`);
  };

  return (
    <div className="w-full space-y-2">
      {(enableColumnVisibility || enableCSVExport) && (
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border-b border-slate-200 rounded-t-lg">
          <span className="text-xs font-semibold text-slate-600">{tableName} Options</span>
          <div className="flex items-center gap-2">
            {enableColumnVisibility && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColMenuOpen(prev => !prev)}
                  className="px-2.5 py-1.5 border border-slate-300 bg-white rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-[#1A5C5E] cursor-pointer"
                >
                  Columns
                </button>
                {isColMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-2 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">Toggle Columns</p>
                    {columns.map((col, idx) => (
                      <label key={idx} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns[idx]}
                          onChange={(e) => {
                            const updated = [...visibleColumns];
                            updated[idx] = e.target.checked;
                            setVisibleColumns(updated);
                          }}
                          className="rounded-sm border-slate-350 text-[#1A5C5E] focus:ring-[#1A5C5E]"
                        />
                        <span>{col.header}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {enableCSVExport && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 border border-[#1A5C5E] bg-[#1A5C5E] text-white rounded-lg text-[11px] font-semibold hover:bg-[#134446] focus:ring-2 focus:ring-[#1A5C5E] cursor-pointer"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded-sm border-slate-300 text-[#1A5C5E] focus:ring-[#1A5C5E]"
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col, idx) => {
              if (!visibleColumns[idx]) return null;
              const isSorted = sortColIndex === idx;
              return (
                <TableHead 
                  key={idx} 
                  className={`${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:text-[#1A5C5E]' : ''}`}
                  onClick={() => handleHeaderClick(idx, col)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="shrink-0 text-slate-400">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#1A5C5E]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[#1A5C5E]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 opacity-60 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => {
            const isRowSelected = selectedRows.some(r => keyExtractor(r) === keyExtractor(item));
            return (
              <TableRow 
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50/80 transition-colors' : ''} ${isRowSelected ? 'bg-slate-50/50' : ''}`}
              >
                {enableSelection && (
                  <TableCell className="w-12 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={(e) => handleSelectRow(item, e.target.checked)}
                      className="rounded-sm border-slate-300 text-[#1A5C5E] focus:ring-[#1A5C5E]"
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((col, idx) => {
                  if (!visibleColumns[idx]) return null;
                  return (
                    <TableCell key={idx} className={col.className}>
                      {col.render(item)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ==========================================
// 5. ADMIN MOBILE RECORD
// ==========================================
interface AdminMobileRecordProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  actionUrl?: string;
  onClick?: () => void;
}

export function AdminMobileRecord({
  title,
  subtitle,
  meta,
  badge,
  actionUrl,
  onClick
}: AdminMobileRecordProps) {
  const CardContent = (
    <div className="admin-mobile-record-body space-y-2 p-3">
      <div className="flex justify-between items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-[var(--admin-text-primary)] m-0 truncate" title={typeof title === 'string' ? title : undefined}>{title}</h4>
          {subtitle && <p className="text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] m-0 mt-0.5 truncate" title={typeof subtitle === 'string' ? subtitle : undefined}>{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[#f4f4f0] text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] min-w-0">
        <div className="truncate">{meta}</div>
        <Eye className="w-3.5 h-3.5 text-[var(--admin-text-secondary)] shrink-0 ml-2" />
      </div>
    </div>
  );

  return (
    <AdminCard className="p-0 overflow-hidden">
      {actionUrl ? (
        <Link href={actionUrl} className="block hover:bg-[var(--admin-surface-subtle)]">
          {CardContent}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className="block text-left w-full hover:bg-[var(--admin-surface-subtle)]">
          {CardContent}
        </button>
      ) : (
        CardContent
      )}
    </AdminCard>
  );
}

// ==========================================
// 6. ADMIN FILTER BAR
// ==========================================
interface FilterOption {
  label: string;
  value: string;
}

interface AdminFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  filterLabel?: string;
}

export function AdminFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  selectedFilter,
  onFilterChange,
  filterOptions,
  filterLabel = 'Status'
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="admin-search-input-box relative flex-1 max-w-md">
        <Search className="absolute left-3 top-3 text-[var(--admin-text-secondary)] pointer-events-none w-4 h-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-3 py-2 border border-[var(--admin-border)] rounded-lg text-xs min-h-[44px]"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="font-semibold text-[var(--admin-text-secondary)] shrink-0">{filterLabel}:</span>
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="p-2 border border-[var(--admin-border)] rounded-lg text-xs bg-[var(--admin-surface)] font-semibold text-[var(--admin-text-primary)] min-h-[44px]"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ==========================================
// 7. ADMIN PAGINATION
// ==========================================
interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  recordsPerPageOptions?: number[];
  onRecordsPerPageChange?: (perPage: number) => void;
  storageKey?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange,
  recordsPerPageOptions = [10, 25, 50, 100],
  onRecordsPerPageChange,
  storageKey
}: AdminPaginationProps) {
  React.useEffect(() => {
    if (storageKey && onRecordsPerPageChange) {
      const saved = sessionStorage.getItem(`${storageKey}_recordsPerPage`);
      if (saved) {
        onRecordsPerPageChange(Number(saved));
      }
    }
  }, [storageKey]);

  const handlePerPageChange = (val: number) => {
    if (onRecordsPerPageChange) {
      if (storageKey) {
        sessionStorage.setItem(`${storageKey}_recordsPerPage`, String(val));
      }
      onRecordsPerPageChange(val);
      onPageChange(1);
    }
  };

  if (totalRecords <= 0) return null;

  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2">
      <div className="flex items-center gap-3">
        <p className="text-[var(--admin-text-secondary)] m-0">
          Showing <span className="font-mono font-semibold text-[var(--admin-text-primary)]">{startRecord}</span> to <span className="font-mono font-semibold text-[var(--admin-text-primary)]">{endRecord}</span> of <span className="font-mono font-semibold text-[var(--admin-text-primary)]">{totalRecords}</span> entries
        </p>
        {onRecordsPerPageChange && (
          <div className="flex items-center gap-1 text-slate-500">
            <span className="text-[11px]">Per page:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-slate-200 rounded-md text-xs font-mono bg-white text-slate-700 cursor-pointer focus:ring-2 focus:ring-[#1A5C5E]"
            >
              {recordsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="admin-btn-secondary !p-2 !min-h-[36px] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              currentPage === page
                ? 'bg-[var(--admin-primary-accent)] text-[#ffffff]'
                : 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)] hover:bg-[#e4e4e7]'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="admin-btn-secondary !p-2 !min-h-[36px] disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 8. ADMIN FORM PRIMITIVES (44px TOUCH TARGETS)
// ==========================================
interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function AdminInput({ label, helperText, error, className = '', ...props }: AdminInputProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block font-semibold text-[var(--admin-text-primary)]">
          {label} {props.required && <span className="text-[var(--admin-status-danger-text)]">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full p-2.5 border rounded-lg text-xs min-h-[44px] ${
          error ? 'border-[#dc2626] bg-[var(--admin-surface-subtle)]' : 'border-[var(--admin-border)] bg-[var(--admin-surface)]'
        } ${className}`}
      />
      {error ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-status-danger-text)] font-semibold m-0">{error}</p>
      ) : helperText ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] m-0">{helperText}</p>
      ) : null}
    </div>
  );
}

interface AdminCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function AdminCheckbox({ label, className = '', checked, ...props }: AdminCheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer text-xs select-none min-h-[44px]">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          {...props}
          className="peer sr-only"
        />
        <div className={`w-4 h-4 rounded-md border border-slate-300 bg-white transition-all peer-checked:bg-[#1A5C5E] peer-checked:border-[#1A5C5E] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1A5C5E]/40 ${className}`} />
        <Check className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      {label && <span className="font-semibold text-slate-700">{label}</span>}
    </label>
  );
}

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function AdminSelect({ label, helperText, error, options, className = '', ...props }: AdminSelectProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block font-semibold text-[var(--admin-text-primary)]">
          {label} {props.required && <span className="text-[var(--admin-status-danger-text)]">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full p-2.5 border rounded-lg text-xs min-h-[44px] bg-[var(--admin-surface)] font-semibold text-[var(--admin-text-primary)] ${
          error ? 'border-[#dc2626]' : 'border-[var(--admin-border)]'
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-status-danger-text)] font-semibold m-0">{error}</p>
      ) : helperText ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] m-0">{helperText}</p>
      ) : null}
    </div>
  );
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function AdminTextarea({ label, helperText, error, className = '', ...props }: AdminTextareaProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block font-semibold text-[var(--admin-text-primary)]">
          {label} {props.required && <span className="text-[var(--admin-status-danger-text)]">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full p-2.5 border rounded-lg text-xs ${
          error ? 'border-[#dc2626] bg-[var(--admin-surface-subtle)]' : 'border-[var(--admin-border)] bg-[var(--admin-surface)]'
        } ${className}`}
      />
      {error ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-status-danger-text)] font-semibold m-0">{error}</p>
      ) : helperText ? (
        <p className="text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] m-0">{helperText}</p>
      ) : null}
    </div>
  );
}

// ==========================================
// 9. ADMIN SKELETON
// ==========================================
interface AdminSkeletonProps {
  type?: 'card' | 'table' | 'line' | 'stat' | 'kpi';
  rows?: number;
}

export function AdminSkeleton({ type = 'card', rows = 3 }: AdminSkeletonProps) {
  if (type === 'stat' || type === 'kpi') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-4 bg-white border rounded-xl space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="p-5 bg-white border rounded-xl space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-20 w-full mt-2" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white border rounded-xl overflow-hidden">
        <Skeleton className="h-10 w-full border-b" />
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-3 w-full" />
      ))}
    </div>
  );
}

// ==========================================
// 10. ADMIN EMPTY STATE
// ==========================================
interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onActionClick
}: AdminEmptyStateProps) {
  return (
    <AdminCard className="text-center py-10">
      <AlertTriangle className="w-10 h-10 text-[var(--admin-text-secondary)] mx-auto mb-2 stroke-[1.2]" />
      <h3 className="font-bold text-xs text-[var(--admin-text-primary)] m-0">{title}</h3>
      <p className="text-xs text-[var(--admin-text-secondary)] max-w-sm mx-auto mt-1 m-0">{description}</p>
      {actionLabel && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="admin-btn-primary mt-4"
        >
          {actionLabel}
        </button>
      )}
    </AdminCard>
  );
}

// ==========================================
// 11. ADMIN QUICK ACTION
// ==========================================
interface AdminQuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  url?: string;
  onClick?: () => void;
}

export function AdminQuickAction({
  title,
  description,
  icon,
  url,
  onClick
}: AdminQuickActionProps) {
  const ActionContent = (
    <div className="flex items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#ccfbf1] text-[var(--admin-primary-accent)] rounded-lg shrink-0 flex items-center justify-center">{icon}</div>
        <div>
          <h4 className="font-semibold text-xs text-[var(--admin-text-primary)] m-0">{title}</h4>
          <p className="text-[var(--admin-font-xs)] text-[var(--admin-text-secondary)] m-0 mt-0.5">{description}</p>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-[var(--admin-primary-accent)] shrink-0 font-bold" />
    </div>
  );

  return (
    <AdminCard className="p-0 overflow-hidden hover:border-[#14b8a6] hover:bg-[#f0fdfa] transition-all">
      {url ? (
        <Link href={url} className="block">
          {ActionContent}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className="block text-left w-full">
          {ActionContent}
        </button>
      )}
    </AdminCard>
  );
}

// ==========================================
// 12. ADMIN ATTENTION ITEM
// ==========================================
interface AdminAttentionItemProps {
  label: string;
  actionUrl: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function AdminAttentionItem({
  label,
  actionUrl,
  badgeText,
  badgeType = 'warning'
}: AdminAttentionItemProps) {
  return (
    <Link href={actionUrl} className="flex items-center justify-between p-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[#14b8a6] hover:bg-[#f0fdfa] text-xs transition-all">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[var(--admin-text-primary)]">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badgeText && (
          <AdminStatusBadge status={badgeText} type={badgeType} />
        )}
        <ArrowRight className="text-[var(--admin-text-secondary)] w-3.5 h-3.5 font-bold" />
      </div>
    </Link>
  );
}

// ==========================================
// 13. PREVIEW MODE BADGE
// ==========================================
export function PreviewModeBadge() {
  return (
    <span className="bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)] text-[var(--admin-font-xs)] font-mono font-semibold px-2 py-0.5 rounded uppercase" title="Local Preview Mode">
      Preview Mode
    </span>
  );
}
