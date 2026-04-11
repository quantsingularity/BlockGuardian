import { Ionicons } from "@expo/vector-icons";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dashboardItems = [
  {
    name: "Portfolio",
    icon: "briefcase",
    screen: "Portfolio",
    color: "#6366f1",
    bg: "#1e1b4b",
  },
  {
    name: "Market Analysis",
    icon: "analytics",
    screen: "MarketAnalysis",
    color: "#0ea5e9",
    bg: "#082f49",
  },
  {
    name: "Blockchain Explorer",
    icon: "search-circle",
    screen: "BlockchainExplorer",
    color: "#8b5cf6",
    bg: "#2e1065",
  },
  {
    name: "AI Recommendations",
    icon: "bulb",
    screen: "AIRecommendations",
    color: "#f59e0b",
    bg: "#1c1400",
  },
  {
    name: "Security Check",
    icon: "shield-checkmark",
    screen: "SecurityCheck",
    color: "#10b981",
    bg: "#022c22",
  },
  {
    name: "Admin Panel",
    icon: "settings",
    screen: "Admin",
    color: "#64748b",
    bg: "#0f172a",
  },
];

const portfolioStats = [
  { label: "Total Value", value: "$56,500", change: "+2.1%", up: true },
  { label: "24h P&L", value: "+$1,200", change: "+2.17%", up: true },
];

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { open, isConnected, address, provider } = useWalletConnectModal();

  const handleConnectDisconnect = () => {
    if (isConnected) {
      provider?.disconnect();
    } else {
      open();
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={[styles.walletBtn, isConnected && styles.walletBtnConnected]}
            onPress={handleConnectDisconnect}
            testID="wallet-button"
          >
            <Ionicons
              name={isConnected ? "log-out-outline" : "wallet-outline"}
              size={16}
              color="#fff"
            />
            <Text style={styles.walletBtnText}>
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Text>
          </TouchableOpacity>
        </View>

        {isConnected && (
          <View style={styles.addressBadge} testID="connected-address">
            <View style={styles.connectedDot} />
            <Text style={styles.addressText}>
              Connected: {formatAddress(address)}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {portfolioStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.statBadge}>
                <Ionicons
                  name={stat.up ? "trending-up" : "trending-down"}
                  size={12}
                  color={stat.up ? "#10b981" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.statChange,
                    { color: stat.up ? "#10b981" : "#ef4444" },
                  ]}
                >
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.grid}>
          {dashboardItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.75}
              testID={`nav-${item.screen}`}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: item.bg, borderColor: item.color + "40" },
                ]}
              >
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.gridLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="pulse" size={18} color="#6366f1" />
            <Text style={styles.summaryTitle}>Account Summary</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Network</Text>
            <Text style={styles.summaryVal}>Ethereum Mainnet</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Assets</Text>
            <Text style={styles.summaryVal}>4 Tokens</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Security Score</Text>
            <Text style={[styles.summaryVal, { color: "#10b981" }]}>
              92 / 100
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: "#64748b", marginBottom: 2 },
  title: { fontSize: 28, fontWeight: "800", color: "#f8fafc" },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletBtnConnected: { backgroundColor: "#dc2626" },
  walletBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  addressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#022c22",
    borderWidth: 1,
    borderColor: "#064e3b",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  addressText: { color: "#34d399", fontSize: 13, fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 6,
  },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statChange: { fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  gridItem: {
    width: "47%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  gridLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryKey: { fontSize: 14, color: "#64748b" },
  summaryVal: { fontSize: 14, color: "#e2e8f0", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#334155" },
});

export default DashboardScreen;
