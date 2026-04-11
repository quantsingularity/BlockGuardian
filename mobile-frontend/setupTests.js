import "@testing-library/jest-native/extend-expect";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-get-random-values", () => ({
  getRandomValues: jest.fn(),
}));

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

jest.mock("@walletconnect/react-native-compat", () => ({}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      type: "wifi",
      isInternetReachable: true,
      details: null,
    }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ component: Component, ...props }) => null,
  }),
}));

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
