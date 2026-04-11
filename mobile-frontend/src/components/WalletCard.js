import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const formatAddress = (addr) => {
  if (!addr) return "Not connected";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

const WalletCard = ({
  address,
  balance,
  currency = "ETH",
  onDisconnect,
  onViewDetails,
  style,
  testID,
}) => {
  return (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="wallet-outline" size={20} color="#818cf8" />
        </View>
        <Text style={styles.cardTitle}>My Wallet</Text>
        <TouchableOpacity
          onPress={onDisconnect}
          style={styles.disconnectBtn}
          activeOpacity={0.8}
          testID="wallet-disconnect"
        >
          <Ionicons name="log-out-outline" size={14} color="#f87171" />
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{formatAddress(address)}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={[styles.infoCell, styles.infoCellRight]}>
          <Text style={styles.infoLabel}>Balance</Text>
          <Text style={styles.infoValue}>
            {balance} <Text style={styles.currency}>{currency}</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onViewDetails}
        style={styles.detailsBtn}
        activeOpacity={0.8}
        testID="wallet-details"
      >
        <Text style={styles.detailsBtnText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: { flex: 1, color: "#f8fafc", fontWeight: "700", fontSize: 16 },
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1c0a0a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  disconnectText: { color: "#f87171", fontSize: 12, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a60",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoCell: { flex: 1 },
  infoCellRight: { alignItems: "flex-end" },
  infoDivider: { width: 1, backgroundColor: "#334155", marginHorizontal: 12 },
  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: { color: "#f1f5f9", fontWeight: "700", fontSize: 15 },
  currency: { color: "#818cf8" },
  detailsBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  detailsBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

export default WalletCard;
