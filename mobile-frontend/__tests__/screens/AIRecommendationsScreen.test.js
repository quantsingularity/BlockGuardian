import { fireEvent, render, screen } from "@testing-library/react-native";
import AIRecommendationsScreen from "../../src/screens/AIRecommendationsScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("AIRecommendationsScreen", () => {
  test("renders AI Risk Score card", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByText("AI Risk Score")).toBeTruthy();
  });

  test("renders Personalized Insights section", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByText(/insights/i)).toBeTruthy();
  });

  test("renders category filter buttons", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Security")).toBeTruthy();
    expect(screen.getByText("Investment")).toBeTruthy();
    expect(screen.getByText("Portfolio")).toBeTruthy();
  });

  test("renders all recommendations by default", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByText("Consider diversifying into DeFi")).toBeTruthy();
    expect(screen.getByText("Review Smart Contract Permissions")).toBeTruthy();
    expect(screen.getByText(/Phishing Alert/)).toBeTruthy();
  });

  test("filters to Security recommendations", () => {
    render(<AIRecommendationsScreen />);
    fireEvent.press(screen.getByText("Security"));
    expect(screen.getByText("Review Smart Contract Permissions")).toBeTruthy();
    expect(screen.queryByText("Consider diversifying into DeFi")).toBeNull();
  });

  test("filters to Investment recommendations", () => {
    render(<AIRecommendationsScreen />);
    fireEvent.press(screen.getByText("Investment"));
    expect(screen.getByText("Consider diversifying into DeFi")).toBeTruthy();
    expect(screen.queryByText("Review Smart Contract Permissions")).toBeNull();
  });

  test("shows All recommendations after switching back", () => {
    render(<AIRecommendationsScreen />);
    fireEvent.press(screen.getByText("Security"));
    fireEvent.press(screen.getByText("All"));
    expect(screen.getByText("Consider diversifying into DeFi")).toBeTruthy();
    expect(screen.getByText("Review Smart Contract Permissions")).toBeTruthy();
  });

  test("renders confidence levels", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByText("Avg Confidence")).toBeTruthy();
  });

  test("renders recommendation cards with testIDs", () => {
    render(<AIRecommendationsScreen />);
    expect(screen.getByTestId("rec-1")).toBeTruthy();
    expect(screen.getByTestId("rec-2")).toBeTruthy();
  });
});
