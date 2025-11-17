/**
 * Constants for blockchain networks and configuration
 */

// Supported blockchain networks
export const NETWORKS = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorerUrl: 'https://etherscan.io'
  },
  POLYGON: {
    id: 137,
    name: 'Polygon Mainnet',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com'
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io'
  },
  OPTIMISM: {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io'
  },
  BSC: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com'
  },
  // Test networks
  GOERLI: {
    id: 5,
    name: 'Goerli Testnet',
    symbol: 'ETH',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorerUrl: 'https://goerli.etherscan.io',
    isTestnet: true
  },
  MUMBAI: {
    id: 80001,
    name: 'Mumbai Testnet',
    symbol: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    isTestnet: true
  }
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.ETHEREUM;

// WalletConnect configuration
export const WALLET_CONNECT_CONFIG = {
  projectId: 'YOUR_PROJECT_ID', // Replace with actual project ID in production
  metadata: {
    name: 'BlockGuardian',
    description: 'Blockchain security and portfolio management',
    url: 'https://blockguardian.io',
    icons: ['https://blockguardian.io/icon.png']
  }
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update'
  },
  PORTFOLIO: {
    LIST: '/portfolio',
    DETAILS: '/portfolio/details',
    ADD: '/portfolio/add',
    UPDATE: '/portfolio/update',
    DELETE: '/portfolio/delete'
  },
  MARKET: {
    PRICES: '/market/prices',
    TRENDS: '/market/trends',
    DETAILS: '/market/details'
  },
  BLOCKCHAIN: {
    TRANSACTIONS: '/blockchain/transactions',
    BALANCE: '/blockchain/balance',
    EXPLORER: '/blockchain/explorer'
  },
  AI: {
    RECOMMENDATIONS: '/ai/recommendations',
    RISK_ANALYSIS: '/ai/risk-analysis',
    SENTIMENT: '/ai/sentiment'
  },
  SECURITY: {
    SCAN: '/security/scan',
    ALERTS: '/security/alerts',
    REPORT: '/security/report'
  },
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'blockguardian_auth_token',
  USER_PROFILE: 'blockguardian_user_profile',
  THEME: 'blockguardian_theme',
  NETWORK: 'blockguardian_network',
  RECENT_ADDRESSES: 'blockguardian_recent_addresses',
  SETTINGS: 'blockguardian_settings'
};

export default {
  NETWORKS,
  DEFAULT_NETWORK,
  WALLET_CONNECT_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS
};
