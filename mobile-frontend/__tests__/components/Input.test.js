import { fireEvent, render, screen } from "@testing-library/react-native";
import Input from "../../src/components/Input";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("Input component", () => {
  test("renders label", () => {
    render(
      <Input label="Email" value="" onChangeText={jest.fn()} testID="input" />,
    );
    expect(screen.getByText("Email")).toBeTruthy();
  });

  test("renders input with placeholder", () => {
    render(
      <Input
        placeholder="Enter email"
        value=""
        onChangeText={jest.fn()}
        testID="input"
      />,
    );
    expect(screen.getByTestId("input").props.placeholder).toBe("Enter email");
  });

  test("calls onChangeText", () => {
    const onChangeText = jest.fn();
    render(<Input value="" onChangeText={onChangeText} testID="input" />);
    fireEvent.changeText(screen.getByTestId("input"), "hello");
    expect(onChangeText).toHaveBeenCalledWith("hello");
  });

  test("renders error message", () => {
    render(
      <Input
        value=""
        onChangeText={jest.fn()}
        error="Field required"
        testID="input"
      />,
    );
    expect(screen.getByText("Field required")).toBeTruthy();
  });

  test("renders icon when provided", () => {
    render(
      <Input
        value=""
        onChangeText={jest.fn()}
        icon="mail-outline"
        testID="input"
      />,
    );
    expect(screen.getByTestId("icon-mail-outline")).toBeTruthy();
  });

  test("uses secureTextEntry when isSecure", () => {
    render(<Input value="" onChangeText={jest.fn()} isSecure testID="input" />);
    expect(screen.getByTestId("input").props.secureTextEntry).toBe(true);
  });
});
