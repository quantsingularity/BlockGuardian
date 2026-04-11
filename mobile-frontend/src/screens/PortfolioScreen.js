import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const portfolioAssets = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    amount: 0.5,
    value: 30000,
    change: "+2.5%",
    color: "#f7931a",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    amount: 10,
    value: 20000,
    change: "-1.2%",
    color: "#627eea",
  },
  {
    id: "3",
    name: "Cardano",
    symbol: "ADA",
    amount: 5000,
    value: 2500,
    change: "+5.0%",
    color: "#0033ad",
  },
  {
    id: "4",
    name: "Solana",
    symbol: "SOL",
    amount: 100,
    value: 4000,
    change: "+3.1%",
    color: "#9945ff",
  },
];

const totalValue = portfolioAssets.reduce((sum, a) => sum + a.value, 0);

const PortfolioScreen = () => {
  const isPositive = (change) => change.startsWith("+");

  const renderAsset = ({ item }) => (
    <TouchableOpacity
      style={styles.assetCard}
      activeOpacity={0.75}
      testID={`asset-${item.id}`}
    >
      <View
        style={[
          styles.assetIcon,
          {
            backgroundColor: item.color + "20",
            borderColor: item.color + "40",
          },
        ]}
      >
        <Text style={[styles.assetIconText, { color: item.color }]}>
          {item.symbol[0]}
        </Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetAmount}>
          {item.amount} {item.symbol}
        </Text>
      </View>
      <View style={styles.assetValues}>
        <Text style={styles.assetValue}>${item.value.toLocaleString()}</Text>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor: isPositive(item.change) ? "#022c22" : "#1c0a0a",
            },
          ]}
        >
          <Ionicons
            name={isPositive(item.change) ? "trending-up" : "trending-down"}
            size={11}
            color={isPositive(item.change) ? "#10b981" : "#ef4444"}
          />
          <Text
            style={[
              styles.changeText,
              { color: isPositive(item.change) ? "#10b981" : "#ef4444" },
            ]}
          >
            {item.change}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const allocation = portfolioAssets.map((a) => ({
    ...a,
    pct: ((a.value / totalValue) * 100).toFixed(1),
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Portfolio Value</Text>
          <Text style={styles.heroValue}>${totalValue.toLocaleString()}</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.heroChange}>+$1,200 (2.17%) today</Text>
          </View>
          <View style={styles.allocationRow}>
            {allocation.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.allocationBar,
                  { flex: parseFloat(a.pct), backgroundColor: a.color },
                ]}
              />
            ))}
          </View>
          <View style={styles.legendRow}>
            {allocation.map((a) => (
              <View key={a.id} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: a.color }]}
                />
                <Text style={styles.legendText}>
                  {a.symbol} {a.pct}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Assets</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={16} color="#6366f1" />
            <Text style={styles.addBtnText}>Add Asset</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={portfolioAssets}
          renderItem={renderAsset}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <View style={styles.performanceCard}>
          <View style={styles.perfHeader}>
            <Ionicons name="bar-chart" size={18} color="#6366f1" />
            <Text style={styles.perfTitle}>Performance Overview</Text>
          </View>
          {[
            { label: "7D Return", value: "+4.2%", up: true },
            { label: "30D Return", value: "+12.8%", up: true },
            { label: "All Time", value: "+156.3%", up: true },
          ].map((row) => (
            <View key={row.label} style={styles.perfRow}>
              <Text style={styles.perfLabel}>{row.label}</Text>
              <Text
                style={[
                  styles.perfValue,
                  { color: row.up ? "#10b981" : "#ef4444" },
                ]}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3730a3",
  },
  heroLabel: {
    fontSize: 13,
    color: "#818cf8",
    fontWeight: "500",
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  heroChange: { color: "#10b981", fontSize: 13, fontWeight: "600" },
  allocationRow: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
    gap: 2,
  },
  allocationBar: { borderRadius: 3 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#94a3b8", fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#6366f1", fontSize: 13, fontWeight: "600" },
  assetCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  assetIconText: { fontSize: 18, fontWeight: "800" },
  assetInfo: { flex: 1 },
  assetName: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" },
  assetAmount: { color: "#64748b", fontSize: 13, marginTop: 2 },
  assetValues: { alignItems: "flex-end" },
  assetValue: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: { fontSize: 12, fontWeight: "600" },
  separator: { height: 8 },
  performanceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  perfHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  perfTitle: { fontSize: 15, fontWeight: "700", color: "#f8fafc" },
  perfRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  perfLabel: { color: "#64748b", fontSize: 14 },
  perfValue: { fontSize: 15, fontWeight: "700" },
});

export default PortfolioScreen;
