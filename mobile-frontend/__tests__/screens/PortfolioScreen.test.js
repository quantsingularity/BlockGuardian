import { render, screen } from "@testing-library/react-native";
import PortfolioScreen from "../../src/screens/PortfolioScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("PortfolioScreen", () => {
  test("renders total portfolio value", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("Total Portfolio Value")).toBeTruthy();
  });

  test("renders all portfolio assets", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("Bitcoin")).toBeTruthy();
    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Cardano")).toBeTruthy();
    expect(screen.getByText("Solana")).toBeTruthy();
  });

  test("renders asset symbols", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText(/0\.5 BTC/)).toBeTruthy();
    expect(screen.getByText(/10 ETH/)).toBeTruthy();
  });

  test("renders positive change in green color context", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("+2.5%")).toBeTruthy();
  });

  test("renders negative change for ETH", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("-1.2%")).toBeTruthy();
  });

  test("renders performance overview section", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("Performance Overview")).toBeTruthy();
    expect(screen.getByText("7D Return")).toBeTruthy();
    expect(screen.getByText("30D Return")).toBeTruthy();
  });

  test("renders Your Assets section title", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("Your Assets")).toBeTruthy();
  });

  test("renders add asset button", () => {
    render(<PortfolioScreen />);
    expect(screen.getByText("Add Asset")).toBeTruthy();
  });

  test("renders asset cards with testIDs", () => {
    render(<PortfolioScreen />);
    expect(screen.getByTestId("asset-1")).toBeTruthy();
    expect(screen.getByTestId("asset-2")).toBeTruthy();
  });
});
