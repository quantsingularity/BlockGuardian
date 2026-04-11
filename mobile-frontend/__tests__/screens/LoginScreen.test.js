import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import LoginScreen from "../../src/screens/LoginScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

jest.mock("../../src/services/AuthService", () => ({
  login: jest.fn().mockResolvedValue({ user: { id: "1" }, token: "tok" }),
}));

const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
};

describe("LoginScreen", () => {
  beforeEach(() => {
    mockNavigation.replace.mockClear();
  });

  test("renders brand name", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    expect(screen.getByText("BlockGuardian")).toBeTruthy();
  });

  test("renders username and password inputs", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    expect(screen.getByTestId("username-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
  });

  test("renders sign in button", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    expect(screen.getByTestId("login-button")).toBeTruthy();
  });

  test("shows validation error when fields empty", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByTestId("login-button"));
    expect(
      screen.getByText(/Please enter your username and password/i),
    ).toBeTruthy();
  });

  test("updates username state on change", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.changeText(screen.getByTestId("username-input"), "testuser");
    expect(screen.getByTestId("username-input").props.value).toBe("testuser");
  });

  test("updates password state on change", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.changeText(screen.getByTestId("password-input"), "secret123");
    expect(screen.getByTestId("password-input").props.value).toBe("secret123");
  });

  test("navigates to Dashboard on successful login", async () => {
    render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.changeText(screen.getByTestId("username-input"), "user@test.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-button"));
    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith("Dashboard");
    });
  });

  test("toggles password visibility", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByTestId("toggle-password"));
    expect(screen.getByTestId("password-input").props.secureTextEntry).toBe(
      false,
    );
  });

  test("renders security badge", () => {
    render(<LoginScreen navigation={mockNavigation} />);
    expect(screen.getByText(/256-bit encrypted/i)).toBeTruthy();
  });
});
