// Application constants and configuration

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_PATH}/auth/login`,
    REGISTER: `${API_BASE_PATH}/auth/register`,
    LOGOUT: `${API_BASE_PATH}/auth/logout`,
    REFRESH: `${API_BASE_PATH}/auth/refresh`,
    ME: `${API_BASE_PATH}/auth/me`,
  },
  PORTFOLIO: {
    LIST: `${API_BASE_PATH}/portfolios`,
    CREATE: `${API_BASE_PATH}/portfolios`,
    DETAIL: (id) => `${API_BASE_PATH}/portfolios/${id}`,
    UPDATE: (id) => `${API_BASE_PATH}/portfolios/${id}`,
    DELETE: (id) => `${API_BASE_PATH}/portfolios/${id}`,
  },
  TRANSACTIONS: {
    LIST: `${API_BASE_PATH}/transactions`,
    CREATE: `${API_BASE_PATH}/transactions`,
    DETAIL: (id) => `${API_BASE_PATH}/transactions/${id}`,
  },
  BLOCKCHAIN: {
    EXPLORE: `${API_BASE_PATH}/blockchain/explore`,
    TRANSACTION: (hash) => `${API_BASE_PATH}/blockchain/transaction/${hash}`,
    ADDRESS: (address) => `${API_BASE_PATH}/blockchain/address/${address}`,
    BLOCK: (number) => `${API_BASE_PATH}/blockchain/block/${number}`,
  },
  ANALYTICS: {
    MARKET: `${API_BASE_PATH}/analytics/market`,
    AI_RECOMMENDATIONS: `${API_BASE_PATH}/analytics/ai-recommendations`,
  },
  ADMIN: {
    USERS: `${API_BASE_PATH}/admin/users`,
    STATS: `${API_BASE_PATH}/admin/stats`,
  },
  HEALTH: "/health",
  INFO: `${API_BASE_PATH}/info`,
};

// Blockchain Network Configuration
export const NETWORKS = {
  MAINNET: { id: 1, name: "Ethereum Mainnet", chainId: "0x1" },
  GOERLI: { id: 5, name: "Goerli Testnet", chainId: "0x5" },
  SEPOLIA: { id: 11155111, name: "Sepolia Testnet", chainId: "0xaa36a7" },
};

// Application Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PORTFOLIO: "/portfolio",
  MARKET_ANALYSIS: "/market-analysis",
  AI_RECOMMENDATIONS: "/ai-recommendations",
  BLOCKCHAIN_EXPLORER: "/blockchain-explorer",
  ADMIN: "/admin",
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  DARK_MODE: "darkMode",
  WALLET_ADDRESS: "wallet_address",
};

// UI Constants
export const THEME = {
  COLORS: {
    PRIMARY: "indigo",
    SECONDARY: "gray",
    SUCCESS: "green",
    ERROR: "red",
    WARNING: "yellow",
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_REQUIRED: "Authentication required. Please login.",
  INVALID_CREDENTIALS: "Invalid credentials.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Validation error. Please check your input.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Successfully logged in!",
  REGISTER: "Successfully registered!",
  LOGOUT: "Successfully logged out!",
  UPDATE: "Successfully updated!",
  DELETE: "Successfully deleted!",
  CREATE: "Successfully created!",
};
