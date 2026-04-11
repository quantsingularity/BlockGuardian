import { fireEvent, render, screen } from "@testing-library/react-native";
import DashboardScreen from "../../src/screens/DashboardScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, testID, ...props }) => {
    const { View } = require("react-native");
    return <View testID={testID || `icon-${name}`} {...props} />;
  },
}));

const mockOpen = jest.fn();
const mockDisconnect = jest.fn();
let mockWalletState = {
  open: mockOpen,
  isConnected: false,
  address: null,
  provider: { disconnect: mockDisconnect },
};

jest.mock("@walletconnect/modal-react-native", () => ({
  useWalletConnectModal: () => mockWalletState,
}));

jest.mock("nativewind", () => ({
  styled: (Component) => Component,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  replace: jest.fn(),
};

describe("DashboardScreen", () => {
  beforeEach(() => {
    mockOpen.mockClear();
    mockDisconnect.mockClear();
    mockNavigate.mockClear();
    mockWalletState = {
      open: mockOpen,
      isConnected: false,
      address: null,
      provider: { disconnect: mockDisconnect },
    };
  });

  test("renders dashboard title", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  test("renders Connect Wallet button when disconnected", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Connect Wallet")).toBeTruthy();
  });

  test("does not show connected address banner when disconnected", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.queryByTestId("connected-address")).toBeNull();
  });

  test("calls WalletConnect open when Connect Wallet pressed", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("wallet-button"));
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  test("renders Disconnect button when connected", () => {
    mockWalletState = {
      open: mockOpen,
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef1234abcd",
      provider: { disconnect: mockDisconnect },
    };
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Disconnect")).toBeTruthy();
  });

  test("shows connected address banner when connected", () => {
    mockWalletState = {
      open: mockOpen,
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef1234abcd",
      provider: { disconnect: mockDisconnect },
    };
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByTestId("connected-address")).toBeTruthy();
  });

  test("calls disconnect when Disconnect pressed", () => {
    mockWalletState = {
      open: mockOpen,
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef1234abcd",
      provider: { disconnect: mockDisconnect },
    };
    render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("wallet-button"));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  test("renders all navigation grid items", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Portfolio")).toBeTruthy();
    expect(screen.getByText("Market Analysis")).toBeTruthy();
    expect(screen.getByText("Blockchain Explorer")).toBeTruthy();
    expect(screen.getByText("AI Recommendations")).toBeTruthy();
    expect(screen.getByText("Security Check")).toBeTruthy();
    expect(screen.getByText("Admin Panel")).toBeTruthy();
  });

  test("navigates to Portfolio screen", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("nav-Portfolio"));
    expect(mockNavigate).toHaveBeenCalledWith("Portfolio");
  });

  test("navigates to AIRecommendations screen", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("nav-AIRecommendations"));
    expect(mockNavigate).toHaveBeenCalledWith("AIRecommendations");
  });

  test("navigates to SecurityCheck screen", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("nav-SecurityCheck"));
    expect(mockNavigate).toHaveBeenCalledWith("SecurityCheck");
  });

  test("renders Account Summary section", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Account Summary")).toBeTruthy();
  });

  test("renders portfolio stats", () => {
    render(<DashboardScreen navigation={mockNavigation} />);
    expect(screen.getByText("Total Value")).toBeTruthy();
  });
});
