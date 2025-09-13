// Re-export all types from services
export * from '../services/matches';
export * from '../services/bets';
export * from '../services/users';
export * from '../services/dashboard';
export * from '../services/api';

// Common utility types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

// API types
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  data?: any;
  params?: any;
  timeout?: number;
}

export class SharedDataError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'SharedDataError';
    this.code = code;
    this.status = status;
  }
}

// Casino types
export interface CasinoGame {
  id: string;
  name: string;
  type: string;
  provider: string;
  houseEdge: number;
  minBet: number;
  maxBet: number;
  isActive: boolean;
  thumbnail?: string;
  description?: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    onPageChange: (page: number) => void;
  };
  actions?: {
    label: string;
    onClick: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export interface FilterOptions {
  search?: string;
  status?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  gameType?: string;
  minHouseEdge?: string;
  maxHouseEdge?: string;
  minBet?: string;
  maxBet?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Component scope types
export type ComponentScope = 'dashboard' | 'user-management' | 'bet-management' | 'match-management';

export interface ComponentProps {
  scope: ComponentScope;
  filters?: FilterOptions;
  onFilterChange?: (filters: FilterOptions) => void;
  onRefresh?: () => void;
}
