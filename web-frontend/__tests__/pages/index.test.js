import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../../pages/index";

jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children }) {
    return <div data-testid="mock-layout">{children}</div>;
  };
});

describe("Index Page (Home)", () => {
  const mockToggleDarkMode = jest.fn();
  const defaultProps = { darkMode: false, toggleDarkMode: mockToggleDarkMode };

  beforeEach(() => {
    mockToggleDarkMode.mockClear();
  });

  test("renders main heading", () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  test("renders description text", () => {
    render(<Home {...defaultProps} />);
    expect(
      screen.getByText(/Comprehensive blockchain security/i),
    ).toBeInTheDocument();
  });

  test("renders primary CTA links", () => {
    render(<Home {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: /Explore Portfolio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Get Started Free/i }),
    ).toBeInTheDocument();
  });

  test("renders feature sections", () => {
    render(<Home {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /AI-Powered Analytics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Blockchain Integration/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Real-time Data/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Security First/i }),
    ).toBeInTheDocument();
  });

  test("renders stats section", () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByText(/\$2\.4B\+/i)).toBeInTheDocument();
    expect(screen.getByText(/99\.9%/i)).toBeInTheDocument();
  });

  test("renders Why Choose section", () => {
    render(<Home {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /Why Choose BlockGuardian/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Advanced Security/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Performance Optimization/i }),
    ).toBeInTheDocument();
  });

  test("renders CTA banner", () => {
    render(<Home {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: /Create Free Account/i }),
    ).toBeInTheDocument();
  });

  test("uses mock layout wrapper", () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
  });
});
