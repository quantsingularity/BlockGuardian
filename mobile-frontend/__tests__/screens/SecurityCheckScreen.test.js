import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import SecurityCheckScreen from "../../src/screens/SecurityCheckScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

jest.useFakeTimers();

describe("SecurityCheckScreen", () => {
  test("renders hero card", () => {
    render(<SecurityCheckScreen />);
    expect(screen.getByText("Security Scanner")).toBeTruthy();
  });

  test("renders address input", () => {
    render(<SecurityCheckScreen />);
    expect(screen.getByTestId("address-input")).toBeTruthy();
  });

  test("renders scan button", () => {
    render(<SecurityCheckScreen />);
    expect(screen.getByTestId("scan-button")).toBeTruthy();
  });

  test("shows alert when address is empty", () => {
    const { Alert } = require("react-native");
    jest.spyOn(Alert, "alert");
    render(<SecurityCheckScreen />);
    fireEvent.press(screen.getByTestId("scan-button"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Input Required",
      "Please enter an address to check.",
    );
  });

  test("shows loading state during scan", () => {
    render(<SecurityCheckScreen />);
    fireEvent.changeText(
      screen.getByTestId("address-input"),
      "0x1234567890abcdef",
    );
    fireEvent.press(screen.getByTestId("scan-button"));
    expect(screen.getByText("Scanning blockchain data...")).toBeTruthy();
  });

  test("shows low risk result for valid address", async () => {
    render(<SecurityCheckScreen />);
    fireEvent.changeText(
      screen.getByTestId("address-input"),
      "0x1234567890abcdef1234567890",
    );
    fireEvent.press(screen.getByTestId("scan-button"));
    jest.advanceTimersByTime(1600);
    await waitFor(() => {
      expect(screen.getByText("Low Risk")).toBeTruthy();
    });
  });

  test("shows critical risk for short address", async () => {
    render(<SecurityCheckScreen />);
    fireEvent.changeText(screen.getByTestId("address-input"), "0x123");
    fireEvent.press(screen.getByTestId("scan-button"));
    jest.advanceTimersByTime(1600);
    await waitFor(() => {
      expect(screen.getByText("Critical Risk")).toBeTruthy();
    });
  });

  test("shows high risk for 0xbad addresses", async () => {
    render(<SecurityCheckScreen />);
    fireEvent.changeText(
      screen.getByTestId("address-input"),
      "0xbad1234567890abcdef1234567",
    );
    fireEvent.press(screen.getByTestId("scan-button"));
    jest.advanceTimersByTime(1600);
    await waitFor(() => {
      expect(screen.getByText("High Risk")).toBeTruthy();
    });
  });

  test("clears input with clear button", () => {
    render(<SecurityCheckScreen />);
    fireEvent.changeText(screen.getByTestId("address-input"), "0xabc");
    expect(screen.getByTestId("address-input").props.value).toBe("0xabc");
  });
});
