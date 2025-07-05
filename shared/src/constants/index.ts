export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_TAX_RATE = 0.08;
export const DEFAULT_TIMEZONE = 'America/New_York';

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const ORDER_STATUS_COLORS = {
  pending: '#fbbf24',
  preparing: '#3b82f6',
  ready: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  card: 'Card',
  digital_wallet: 'Digital Wallet',
  bank_transfer: 'Bank Transfer',
};

export const USER_ROLE_LABELS = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  staff: 'Staff',
};

export const TABLE_STATUS_COLORS = {
  available: '#10b981',
  occupied: '#ef4444',
  reserved: '#f59e0b',
  cleaning: '#6b7280',
};

export const SYNC_INTERVALS = {
  FAST: 5000,
  NORMAL: 15000,
  SLOW: 30000,
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'resto_auth_token',
  USER_DATA: 'resto_user_data',
  CART: 'resto_cart',
  SETTINGS: 'resto_settings',
  OFFLINE_QUEUE: 'resto_offline_queue',
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  CUSTOMERS: '/api/customers',
  TABLES: '/api/tables',
  DASHBOARD: '/api/dashboard',
  SYNC: '/api/sync',
  CONFIG: '/api/config',
};

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_DELETED: 'order_deleted',
  PAYMENT_RECEIVED: 'payment_received',
  SYNC_DATA: 'sync_data',
  USER_ACTIVITY: 'user_activity',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network connection error',
  SYNC_ERROR: 'Synchronization error',
};

export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_DELETED: 'Order deleted successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  SYNC_COMPLETED: 'Synchronization completed',
  DATA_SAVED: 'Data saved successfully',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_MAX_LENGTH: 15,
  EMAIL_MAX_LENGTH: 100,
  PRODUCT_NAME_MAX_LENGTH: 100,
  ORDER_NOTES_MAX_LENGTH: 500,
}; 