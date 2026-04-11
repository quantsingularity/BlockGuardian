import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Layout from "../../components/Layout";

jest.mock("../../components/Navbar", () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

describe("Layout Component", () => {
  const mockToggleDarkMode = jest.fn();

  test("renders children correctly", () => {
    render(
      <Layout darkMode={false} toggleDarkMode={mockToggleDarkMode}>
        <div>Test Content</div>
      </Layout>,
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders Navbar", () => {
    render(
      <Layout darkMode={false} toggleDarkMode={mockToggleDarkMode}>
        <div>Test</div>
      </Layout>,
    );
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("renders footer copyright", () => {
    render(
      <Layout darkMode={false} toggleDarkMode={mockToggleDarkMode}>
        <div>Test</div>
      </Layout>,
    );
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear} BlockGuardian`)),
    ).toBeInTheDocument();
  });

  test("applies dark mode class when darkMode is true", () => {
    const { container } = render(
      <Layout darkMode={true} toggleDarkMode={mockToggleDarkMode}>
        <div>Test</div>
      </Layout>,
    );
    expect(container.querySelector(".dark")).toBeInTheDocument();
  });

  test("does not apply dark mode class when darkMode is false", () => {
    const { container } = render(
      <Layout darkMode={false} toggleDarkMode={mockToggleDarkMode}>
        <div>Test</div>
      </Layout>,
    );
    expect(container.querySelector(".dark")).not.toBeInTheDocument();
  });

  test("renders footer platform links", () => {
    render(
      <Layout darkMode={false} toggleDarkMode={mockToggleDarkMode}>
        <div>Test</div>
      </Layout>,
    );
    expect(
      screen.getByRole("link", { name: /Portfolio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Dashboard/i }),
    ).toBeInTheDocument();
  });

  test("renders custom title when provided", () => {
    render(
      <Layout
        darkMode={false}
        toggleDarkMode={mockToggleDarkMode}
        title="Test Page"
      >
        <div>Test</div>
      </Layout>,
    );
    expect(document.title).toMatch(/Test Page/i);
  });
});
