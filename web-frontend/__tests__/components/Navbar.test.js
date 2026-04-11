import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../../components/Navbar";

jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
    push: jest.fn(),
  }),
}));

jest.mock("../../components/WalletConnection", () => {
  return function MockWalletConnection() {
    return <div data-testid="wallet-connection">WalletConnection</div>;
  };
});

describe("Navbar Component", () => {
  const mockToggleDarkMode = jest.fn();

  beforeEach(() => {
    mockToggleDarkMode.mockClear();
  });

  test("renders brand name BlockGuardian", () => {
    render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
    expect(screen.getByText("BlockGuardian")).toBeInTheDocument();
  });

  test("renders desktop navigation links", () => {
    render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
    expect(
      screen.getAllByRole("link", { name: /Home/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Portfolio/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Market/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /AI Insights/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Explorer/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Dashboard/i }).length,
    ).toBeGreaterThan(0);
  });

  test("renders dark mode toggle button", () => {
    const { rerender } = render(
      <Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />,
    );
    const toggleBtn = screen.getByRole("button", { name: /Toggle dark mode/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);

    rerender(<Navbar darkMode={true} toggleDarkMode={mockToggleDarkMode} />);
    expect(
      screen.getByRole("button", { name: /Toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  test("toggles mobile menu visibility", () => {
    render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
    const menuButton = screen.getByRole("button", { name: /Open main menu/i });

    fireEvent.click(menuButton);
    expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(
      screen.queryByRole("link", { name: /Sign In/i }),
    ).not.toBeInTheDocument();
  });

  test("renders WalletConnection component", () => {
    render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
    expect(screen.getAllByTestId("wallet-connection").length).toBeGreaterThan(
      0,
    );
  });

  test("renders mobile navigation links when menu is open", () => {
    render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
    const menuButton = screen.getByRole("button", { name: /Open main menu/i });
    fireEvent.click(menuButton);

    const allLinks = screen.getAllByRole("link");
    const linkTexts = allLinks.map((l) => l.textContent);
    expect(linkTexts.some((t) => t.includes("Portfolio"))).toBe(true);
    expect(linkTexts.some((t) => t.includes("Dashboard"))).toBe(true);
  });
});
