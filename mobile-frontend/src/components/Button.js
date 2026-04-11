import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const VARIANT_STYLES = {
  primary: { backgroundColor: "#4f46e5" },
  secondary: { backgroundColor: "#475569" },
  danger: { backgroundColor: "#dc2626" },
  success: { backgroundColor: "#16a34a" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#64748b",
  },
};

const SIZE_STYLES = {
  sm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  md: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
};

const ICON_SIZE = { sm: 14, md: 16, lg: 20 };
const TEXT_SIZE = { sm: 13, md: 15, lg: 17 };

const Button = ({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  icon,
  onPress,
  style,
  testID,
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;
  const disabled = isDisabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyle,
        variantStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={ICON_SIZE[size]}
              color="#ffffff"
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { fontSize: TEXT_SIZE[size] }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.5 },
  icon: { marginRight: 6 },
  text: { color: "#ffffff", fontWeight: "700" },
});

export default Button;
