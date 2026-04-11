import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text, TouchableOpacity, View } from "react-native";

const TestButton = ({ onPress, label, disabled }) => (
  <View testID="test-button-container">
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID="test-button"
    >
      <Text testID="test-button-label">{label}</Text>
    </TouchableOpacity>
  </View>
);

describe("TestButton Component", () => {
  test("renders label text", () => {
    render(<TestButton onPress={jest.fn()} label="Click Me" />);
    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  test("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<TestButton onPress={onPress} label="Click" />);
    fireEvent.press(screen.getByTestId("test-button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<TestButton onPress={onPress} label="Disabled" disabled />);
    fireEvent.press(screen.getByTestId("test-button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  test("renders container", () => {
    render(<TestButton onPress={jest.fn()} label="Test" />);
    expect(screen.getByTestId("test-button-container")).toBeTruthy();
  });
});
