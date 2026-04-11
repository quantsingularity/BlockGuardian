import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Card = ({
  title,
  subtitle,
  imageUri,
  children,
  onPress,
  icon,
  style,
  testID,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      testID={testID}
    >
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.body}>
        {(icon || title) && (
          <View style={styles.titleRow}>
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color="#6366f1"
                style={styles.titleIcon}
              />
            )}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: "100%", height: 160 },
  body: { padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  titleIcon: { marginRight: 8 },
  title: { color: "#f8fafc", fontWeight: "700", fontSize: 16, flex: 1 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 12 },
});

export default Card;
