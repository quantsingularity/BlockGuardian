import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

const LoadingOverlay = ({
  visible = false,
  message = "Loading...",
  subMessage,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.message}>{message}</Text>
          {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 200,
    gap: 16,
  },
  message: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  subMessage: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
  },
});

export default LoadingOverlay;
