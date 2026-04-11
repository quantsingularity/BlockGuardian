import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../../pages/dashboard";

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children }) {
    return <div data-testid="mock-layout">{children}</div>;
  };
});

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const defaultProps = { darkMode: false, toggleDarkMode: jest.fn() };

describe("Dashboard Page", () => {
  test("renders page heading", () => {
    render(<Dashboard {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /Dashboard/i }),
    ).toBeInTheDocument();
  });

  test("renders welcome message", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  test("renders all tab buttons", () => {
    render(<Dashboard {...defaultProps} />);
    const tabs = [
      "overview",
      "portfolio",
      "activity",
      "notifications",
      "settings",
    ];
    tabs.forEach((tab) => {
      expect(
        screen.getByRole("button", { name: new RegExp(tab, "i") }),
      ).toBeInTheDocument();
    });
  });

  test("shows overview content by default", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/Total Portfolio Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Asset Allocation/i)).toBeInTheDocument();
  });

  test("switches to activity tab", () => {
    render(<Dashboard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /activity/i }));
    expect(screen.getByText(/Activity History/i)).toBeInTheDocument();
  });

  test("switches to notifications tab", () => {
    render(<Dashboard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(screen.getByText(/All Notifications/i)).toBeInTheDocument();
  });

  test("switches to settings tab", () => {
    render(<Dashboard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
  });

  test("KPI cards display correct values", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/\$1,245,000/i)).toBeInTheDocument();
    expect(screen.getByText(/\+5\.8%/i)).toBeInTheDocument();
    expect(screen.getByText(/\+18\.3%/i)).toBeInTheDocument();
  });

  test("renders recent activity items", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getAllByText(/AAPL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);
  });

  test("renders quick action buttons", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Deposit/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade/i)).toBeInTheDocument();
  });
});
