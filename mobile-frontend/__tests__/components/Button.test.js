import { fireEvent, render, screen } from "@testing-library/react-native";
import Button from "../../src/components/Button";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("Button component", () => {
  test("renders title", () => {
    render(<Button title="Click Me" onPress={jest.fn()} testID="btn" />);
    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  test("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button title="Press" onPress={onPress} testID="btn" />);
    fireEvent.press(screen.getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Press" onPress={onPress} isDisabled testID="btn" />);
    fireEvent.press(screen.getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
  });

  test("shows loading indicator when isLoading", () => {
    render(<Button title="Load" onPress={jest.fn()} isLoading testID="btn" />);
    expect(screen.queryByText("Load")).toBeNull();
  });

  test("does not call onPress when loading", () => {
    const onPress = jest.fn();
    render(<Button title="Load" onPress={onPress} isLoading testID="btn" />);
    fireEvent.press(screen.getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
  });

  test("renders icon when provided", () => {
    render(
      <Button
        title="With Icon"
        onPress={jest.fn()}
        icon="home-outline"
        testID="btn"
      />,
    );
    expect(screen.getByTestId("icon-home-outline")).toBeTruthy();
  });
});
