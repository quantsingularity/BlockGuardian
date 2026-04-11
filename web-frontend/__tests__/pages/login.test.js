import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../../pages/login";

jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const defaultProps = { darkMode: false, toggleDarkMode: jest.fn() };

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form by default", () => {
    render(<Login {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /Welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in/i }),
    ).toBeInTheDocument();
  });

  test("renders dark mode toggle button", () => {
    render(<Login {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  test("toggles to signup form", () => {
    render(<Login {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign up for free/i }));
    expect(
      screen.getByRole("heading", { name: /Create an account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  test("updates email and password fields on input", () => {
    render(<Login {...defaultProps} />);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("shows error for empty fields on submit", async () => {
    render(<Login {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    expect(
      await screen.findByText(/Please fill in all required fields/i),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("shows error for password mismatch on signup", async () => {
    render(<Login {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign up for free/i }));

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "j@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "different456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));
    expect(
      await screen.findByText(/Passwords do not match/i),
    ).toBeInTheDocument();
  });

  test("clears error when toggling between login and signup", () => {
    render(<Login {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sign up for free/i }));
    expect(
      screen.queryByText(/Please fill in all required fields/i),
    ).not.toBeInTheDocument();
  });

  test("simulates successful login and redirects", async () => {
    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });

    const submitBtn = screen.getByRole("button", { name: /Sign in/i });
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"), {
      timeout: 2500,
    });
  });

  test("toggles password visibility", () => {
    render(<Login {...defaultProps} />);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /Show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /Hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("renders social login buttons", () => {
    render(<Login {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: /Sign in with Google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sign in with Twitter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sign in with GitHub/i }),
    ).toBeInTheDocument();
  });

  test("renders terms and privacy links", () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByRole("link", { name: /Terms/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Privacy Policy/i }),
    ).toBeInTheDocument();
  });
});
