// Jest setup for mobile-frontend
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-get-random-values
jest.mock("react-native-get-random-values", () => ({
  getRandomValues: jest.fn(),
}));

// Mock WalletConnect
jest.mock("@walletconnect/modal-react-native", () => ({
  WalletConnectModal: "WalletConnectModal",
  useWalletConnectModal: jest.fn(() => ({
    open: jest.fn(),
    close: jest.fn(),
    isConnected: false,
    address: null,
    provider: null,
  })),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
