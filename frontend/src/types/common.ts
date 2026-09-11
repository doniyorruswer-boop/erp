/**
 * Common system-wide interfaces and types
 */

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  thClass?: string;
  tdClass?: string;
  width?: string;
  formatter?: (val: unknown, row: T) => string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface DateRangePayload {
  start: string | null;
  end: string | null;
  rangeKey?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  items?: T[];
  total?: number;
  message?: string;
  statusCode?: number;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  handler?: () => void;
}
