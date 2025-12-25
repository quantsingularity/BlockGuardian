/**
 * Constants for blockchain networks and configuration
 */

// Supported blockchain networks
export const NETWORKS = {
    ETHEREUM: {
        id: 1,
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        rpcUrl: process.env.EXPO_PUBLIC_ETH_RPC_URL || 'https://ethereum.publicnode.com',
        blockExplorerUrl: 'https://etherscan.io',
    },
    POLYGON: {
        id: 137,
        name: 'Polygon Mainnet',
        symbol: 'MATIC',
        rpcUrl: process.env.EXPO_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
    },
    ARBITRUM: {
        id: 42161,
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpcUrl: process.env.EXPO_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
        blockExplorerUrl: 'https://arbiscan.io',
    },
    OPTIMISM: {
        id: 10,
        name: 'Optimism',
        symbol: 'ETH',
        rpcUrl: process.env.EXPO_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
        blockExplorerUrl: 'https://optimistic.etherscan.io',
    },
    BSC: {
        id: 56,
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        rpcUrl: process.env.EXPO_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
        blockExplorerUrl: 'https://bscscan.com',
    },
    // Test networks
    GOERLI: {
        id: 5,
        name: 'Goerli Testnet',
        symbol: 'ETH',
        rpcUrl: 'https://goerli.infura.io/v3/',
        blockExplorerUrl: 'https://goerli.etherscan.io',
        isTestnet: true,
    },
    SEPOLIA: {
        id: 11155111,
        name: 'Sepolia Testnet',
        symbol: 'ETH',
        rpcUrl: 'https://sepolia.infura.io/v3/',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        isTestnet: true,
    },
    MUMBAI: {
        id: 80001,
        name: 'Mumbai Testnet',
        symbol: 'MATIC',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        blockExplorerUrl: 'https://mumbai.polygonscan.com',
        isTestnet: true,
    },
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.ETHEREUM;

// WalletConnect configuration
export const WALLET_CONNECT_CONFIG = {
    projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id-change-this',
    metadata: {
        name: process.env.EXPO_PUBLIC_APP_NAME || 'BlockGuardian',
        description: 'Blockchain security and portfolio management',
        url: process.env.EXPO_PUBLIC_APP_URL || 'https://blockguardian.io',
        icons: [process.env.EXPO_PUBLIC_APP_ICON_URL || 'https://blockguardian.io/icon.png'],
    },
};

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
    },
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/update',
        SETTINGS: '/user/settings',
    },
    PORTFOLIO: {
        LIST: '/portfolios',
        DETAILS: '/portfolios/:id',
        CREATE: '/portfolios',
        UPDATE: '/portfolios/:id',
        DELETE: '/portfolios/:id',
        ASSETS: '/portfolios/:id/assets',
        PERFORMANCE: '/portfolios/:id/performance',
    },
    MARKET: {
        PRICES: '/market/prices',
        TRENDS: '/market/trends',
        DETAILS: '/market/:coinId',
        SEARCH: '/market/search',
        CHART: '/market/:coinId/chart',
    },
    BLOCKCHAIN: {
        TRANSACTIONS: '/blockchain/transactions',
        BALANCE: '/blockchain/balance',
        EXPLORER: '/blockchain/explorer',
        ADDRESS_INFO: '/blockchain/address/:address',
        TX_INFO: '/blockchain/tx/:txHash',
    },
    AI: {
        RECOMMENDATIONS: '/ai/recommendations',
        RISK_ANALYSIS: '/ai/risk-analysis',
        SENTIMENT: '/ai/sentiment',
        PREDICTIONS: '/ai/predictions',
        OPTIMIZE: '/ai/optimize',
    },
    SECURITY: {
        SCAN: '/security/scan',
        ALERTS: '/security/alerts',
        REPORT: '/security/report',
        VERIFY: '/security/verify',
        CHECK_TX: '/security/check-transaction',
    },
    ADMIN: {
        USERS: '/admin/users',
        STATS: '/admin/stats',
        SETTINGS: '/admin/settings',
        AUDIT_LOGS: '/admin/audit-logs',
    },
};

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'blockguardian_auth_token',
    USER_PROFILE: 'blockguardian_user_profile',
    THEME: 'blockguardian_theme',
    NETWORK: 'blockguardian_network',
    RECENT_ADDRESSES: 'blockguardian_recent_addresses',
    SETTINGS: 'blockguardian_settings',
    WALLET_ADDRESS: 'blockguardian_wallet_address',
    PORTFOLIO_CACHE: 'blockguardian_portfolio_cache',
};

// App configuration
export const APP_CONFIG = {
    DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
    API_TIMEOUT: 30000, // 30 seconds
    CACHE_DURATION: 300000, // 5 minutes
    POLLING_INTERVAL: 60000, // 1 minute
};

// Risk levels
export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
};

// Risk level colors
export const RISK_COLORS = {
    [RISK_LEVELS.LOW]: '#10b981', // green
    [RISK_LEVELS.MEDIUM]: '#f59e0b', // yellow
    [RISK_LEVELS.HIGH]: '#f97316', // orange
    [RISK_LEVELS.CRITICAL]: '#ef4444', // red
};

export default {
    NETWORKS,
    DEFAULT_NETWORK,
    WALLET_CONNECT_CONFIG,
    API_ENDPOINTS,
    STORAGE_KEYS,
    APP_CONFIG,
    RISK_LEVELS,
    RISK_COLORS,
};
