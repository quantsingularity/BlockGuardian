import { fireEvent, render, screen } from "@testing-library/react-native";
import Card from "../../src/components/Card";
import { Text } from "react-native";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }) => {
    const { View } = require("react-native");
    return <View testID={`icon-${name}`} />;
  },
}));

describe("Card component", () => {
  test("renders title", () => {
    render(<Card title="My Card" testID="card" />);
    expect(screen.getByText("My Card")).toBeTruthy();
  });

  test("renders subtitle when provided", () => {
    render(<Card title="Card" subtitle="A subtitle" testID="card" />);
    expect(screen.getByText("A subtitle")).toBeTruthy();
  });

  test("renders children", () => {
    render(
      <Card title="Card" testID="card">
        <Text>Child content</Text>
      </Card>,
    );
    expect(screen.getByText("Child content")).toBeTruthy();
  });

  test("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Card title="Pressable" onPress={onPress} testID="card" />);
    fireEvent.press(screen.getByTestId("card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("renders icon when provided", () => {
    render(<Card title="With Icon" icon="star-outline" testID="card" />);
    expect(screen.getByTestId("icon-star-outline")).toBeTruthy();
  });

  test("renders without optional props", () => {
    render(<Card title="Minimal" testID="card" />);
    expect(screen.getByTestId("card")).toBeTruthy();
  });
});
