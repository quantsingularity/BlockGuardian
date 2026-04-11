import { fireEvent, render, screen } from "@testing-library/react-native";
import WalletCard from "../../src/components/WalletCard";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("WalletCard component", () => {
  const defaultProps = {
    address: "0x1234567890abcdef1234",
    balance: "1.234",
    currency: "ETH",
    onDisconnect: jest.fn(),
    onViewDetails: jest.fn(),
  };

  test("renders wallet title", () => {
    render(<WalletCard {...defaultProps} testID="wallet" />);
    expect(screen.getByText("My Wallet")).toBeTruthy();
  });

  test("formats and displays address", () => {
    render(<WalletCard {...defaultProps} testID="wallet" />);
    expect(screen.getByText("0x1234...cdef")).toBeTruthy();
  });

  test("displays balance and currency", () => {
    render(<WalletCard {...defaultProps} testID="wallet" />);
    expect(screen.getByText("1.234")).toBeTruthy();
    expect(screen.getByText("ETH")).toBeTruthy();
  });

  test("calls onDisconnect when disconnect pressed", () => {
    render(<WalletCard {...defaultProps} testID="wallet" />);
    fireEvent.press(screen.getByTestId("wallet-disconnect"));
    expect(defaultProps.onDisconnect).toHaveBeenCalled();
  });

  test("calls onViewDetails when details pressed", () => {
    render(<WalletCard {...defaultProps} testID="wallet" />);
    fireEvent.press(screen.getByTestId("wallet-details"));
    expect(defaultProps.onViewDetails).toHaveBeenCalled();
  });

  test("shows Not connected when no address", () => {
    render(<WalletCard {...defaultProps} address={null} testID="wallet" />);
    expect(screen.getByText("Not connected")).toBeTruthy();
  });
});
