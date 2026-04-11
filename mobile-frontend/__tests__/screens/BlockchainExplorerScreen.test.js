import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import BlockchainExplorerScreen from "../../src/screens/BlockchainExplorerScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

jest.useFakeTimers();

describe("BlockchainExplorerScreen", () => {
  test("renders search input", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByTestId("search-input")).toBeTruthy();
  });

  test("renders search button", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByTestId("search-button")).toBeTruthy();
  });

  test("renders network status section", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByText("Network Status")).toBeTruthy();
    expect(screen.getByText("LIVE")).toBeTruthy();
  });

  test("renders network stats", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByText("Latest Block")).toBeTruthy();
    expect(screen.getByText("Gas Price")).toBeTruthy();
    expect(screen.getByText("TPS")).toBeTruthy();
  });

  test("renders latest transactions section", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByText("Latest Transactions")).toBeTruthy();
  });

  test("renders transaction cards with testIDs", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByTestId("tx-1")).toBeTruthy();
    expect(screen.getByTestId("tx-2")).toBeTruthy();
    expect(screen.getByTestId("tx-3")).toBeTruthy();
  });

  test("updates search query on input", () => {
    render(<BlockchainExplorerScreen />);
    fireEvent.changeText(screen.getByTestId("search-input"), "0xabc123");
    expect(screen.getByTestId("search-input").props.value).toBe("0xabc123");
  });

  test("shows search result after searching", async () => {
    render(<BlockchainExplorerScreen />);
    fireEvent.changeText(
      screen.getByTestId("search-input"),
      "0x1234567890abcdef1234567890abcdef12345678",
    );
    fireEvent.press(screen.getByTestId("search-button"));
    jest.advanceTimersByTime(900);
    await waitFor(() => {
      expect(screen.getByText("Address")).toBeTruthy();
    });
  });

  test("renders View All link", () => {
    render(<BlockchainExplorerScreen />);
    expect(screen.getByText("View All")).toBeTruthy();
  });
});
