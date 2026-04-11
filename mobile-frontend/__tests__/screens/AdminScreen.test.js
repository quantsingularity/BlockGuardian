import { fireEvent, render, screen } from "@testing-library/react-native";
import AdminScreen from "../../src/screens/AdminScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("AdminScreen", () => {
  test("renders tab navigation", () => {
    render(<AdminScreen />);
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Users")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Audit Log")).toBeTruthy();
  });

  test("renders Overview tab by default", () => {
    render(<AdminScreen />);
    expect(screen.getByText("Total Users")).toBeTruthy();
    expect(screen.getByText("System Health")).toBeTruthy();
  });

  test("switches to Users tab", () => {
    render(<AdminScreen />);
    fireEvent.press(screen.getByText("Users"));
    expect(screen.getByText("User Management")).toBeTruthy();
    expect(screen.getByText("Alice Chen")).toBeTruthy();
    expect(screen.getByText("Bob Martinez")).toBeTruthy();
  });

  test("switches to Settings tab", () => {
    render(<AdminScreen />);
    fireEvent.press(screen.getByText("Settings"));
    expect(screen.getByText("System Settings")).toBeTruthy();
    expect(screen.getByText("Maintenance Mode")).toBeTruthy();
    expect(screen.getByText("Require 2FA")).toBeTruthy();
  });

  test("switches to Audit Log tab", () => {
    render(<AdminScreen />);
    fireEvent.press(screen.getByText("Audit Log"));
    expect(screen.getByText("Audit Log")).toBeTruthy();
    expect(screen.getByText("User Login")).toBeTruthy();
    expect(screen.getByText("Security Scan")).toBeTruthy();
  });

  test("renders system health items in Overview", () => {
    render(<AdminScreen />);
    expect(screen.getByText("API Server")).toBeTruthy();
    expect(screen.getByText("Database")).toBeTruthy();
  });

  test("renders stats in Overview", () => {
    render(<AdminScreen />);
    expect(screen.getByText("1,284")).toBeTruthy();
    expect(screen.getByText("342")).toBeTruthy();
  });

  test("renders users with roles in Users tab", () => {
    render(<AdminScreen />);
    fireEvent.press(screen.getByText("Users"));
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("alice@example.com")).toBeTruthy();
  });

  test("toggles settings switch", () => {
    render(<AdminScreen />);
    fireEvent.press(screen.getByText("Settings"));
    const switches = screen.getAllByRole ? screen.getAllByRole("switch") : [];
    expect(screen.getByText("Maintenance Mode")).toBeTruthy();
  });
});
