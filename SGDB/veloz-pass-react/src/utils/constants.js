export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CSRF_TOKEN: '/csrf-token',
  },
  PAYMENTS: {
    WALLET_DATA: '/api/payments/wallet-data',
    HISTORICO: '/api/payments/historico-geral',
    ADD_CREDIT: '/api/payments/add-credit',
    RECARGA_TRANSPORTE: '/api/payments/recarga-transporte',
    SAVE_CARD: '/api/payments/save-card',
    VERIFY_CARD: '/api/payments/verify-card',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    CREATE: '/api/notifications',
  },
};

export const TRANSACTION_STATUS = {
  SUCCESS: 'success',
  PENDING: 'under-review',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
};

export const PAYMENT_METHODS = {
  DEBIT: 'DEBITO',
  CREDIT: 'CREDITO',
  INTERNATIONAL: 'INTERNACIONAL',
  PIX: 'PIX',
  DIGITAL_WALLET: 'CARTEIRA_DIGITAL',
};

export const MOVEMENT_TYPES = {
  CREDIT: 'credito',
  DEBIT: 'debito',
  TRANSFER: 'transferencia',
  RECHARGE: 'recarga',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const PUBLIC_ROUTES = ['/introduction', '/register'];

export const PROTECTED_ROUTES = ['/dashboard', '/carteira_digital', '/recarga', '/historico'];
