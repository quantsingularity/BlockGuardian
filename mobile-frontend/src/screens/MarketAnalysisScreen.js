import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TIMEFRAMES = ["1H", "24H", "7D", "1M", "1Y"];

const topMovers = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$67,234",
    change: "+3.5%",
    up: true,
    mktCap: "$1.3T",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,412",
    change: "-1.1%",
    up: false,
    mktCap: "$410B",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$182",
    change: "+5.2%",
    up: true,
    mktCap: "$82B",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: "$608",
    change: "+1.8%",
    up: true,
    mktCap: "$88B",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: "$0.51",
    change: "-2.3%",
    up: false,
    mktCap: "$18B",
  },
];

const sentimentData = [
  {
    label: "Fear & Greed Index",
    value: "72",
    sentiment: "Greed",
    color: "#f59e0b",
  },
  {
    label: "Market Dominance BTC",
    value: "52.4%",
    sentiment: "High",
    color: "#6366f1",
  },
  {
    label: "Active Addresses",
    value: "1.2M",
    sentiment: "+8%",
    color: "#10b981",
  },
];

const MarketAnalysisScreen = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("24H");

  const barHeights = [40, 65, 45, 80, 60, 90, 55, 70, 85, 50, 75, 95];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewLabel}>Total Market Cap</Text>
              <Text style={styles.overviewValue}>$2.41T</Text>
              <View style={styles.overviewBadge}>
                <Ionicons name="trending-up" size={13} color="#10b981" />
                <Text style={styles.overviewChange}>+2.4% (24h)</Text>
              </View>
            </View>
            <View style={styles.overviewRight}>
              <Text style={styles.overviewVolLabel}>24h Volume</Text>
              <Text style={styles.overviewVol}>$98.3B</Text>
            </View>
          </View>

          <View style={styles.timeframeRow}>
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.tfBtn,
                  activeTimeframe === tf && styles.tfBtnActive,
                ]}
                onPress={() => setActiveTimeframe(tf)}
              >
                <Text
                  style={[
                    styles.tfText,
                    activeTimeframe === tf && styles.tfTextActive,
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartArea}>
            <View style={styles.chartBars}>
              {barHeights.map((h, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: h,
                        backgroundColor:
                          i === barHeights.length - 1 ? "#6366f1" : "#334155",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>Jan</Text>
              <Text style={styles.chartLabel}>Apr</Text>
              <Text style={styles.chartLabel}>Now</Text>
            </View>
          </View>
        </View>

        <View style={styles.sentimentRow}>
          {sentimentData.map((item) => (
            <View key={item.label} style={styles.sentimentCard}>
              <Text style={styles.sentimentLabel}>{item.label}</Text>
              <Text style={[styles.sentimentValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.sentimentSub}>{item.sentiment}</Text>
            </View>
          ))}
        </View>

        <View style={styles.moversCard}>
          <View style={styles.moversHeader}>
            <Ionicons name="rocket" size={18} color="#6366f1" />
            <Text style={styles.moversTitle}>Top Assets</Text>
          </View>

          <View style={styles.moversTableHeader}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Asset</Text>
            <Text style={[styles.colHeader, { flex: 1.5, textAlign: "right" }]}>
              Price
            </Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: "right" }]}>
              24h
            </Text>
            <Text style={[styles.colHeader, { flex: 2, textAlign: "right" }]}>
              Mkt Cap
            </Text>
          </View>

          {topMovers.map((coin, i) => (
            <View key={coin.symbol}>
              <TouchableOpacity style={styles.moverRow} activeOpacity={0.7}>
                <View
                  style={[
                    styles.coinIcon,
                    { backgroundColor: coin.up ? "#022c22" : "#1c0a0a" },
                  ]}
                >
                  <Text
                    style={[
                      styles.coinIconText,
                      { color: coin.up ? "#10b981" : "#ef4444" },
                    ]}
                  >
                    {coin.symbol[0]}
                  </Text>
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                  <Text style={styles.coinName}>{coin.name}</Text>
                </View>
                <Text style={[styles.coinPrice, { flex: 1.5 }]}>
                  {coin.price}
                </Text>
                <View
                  style={[
                    styles.changePill,
                    {
                      flex: 1,
                      backgroundColor: coin.up ? "#022c22" : "#1c0a0a",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeText,
                      { color: coin.up ? "#10b981" : "#ef4444" },
                    ]}
                  >
                    {coin.change}
                  </Text>
                </View>
                <Text style={[styles.coinMktCap, { flex: 2 }]}>
                  {coin.mktCap}
                </Text>
              </TouchableOpacity>
              {i < topMovers.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Ionicons name="pulse" size={18} color="#8b5cf6" />
            <Text style={styles.trendTitle}>Market Trends</Text>
          </View>
          {[
            { label: "DeFi TVL", value: "$98.2B", change: "+4.1%", up: true },
            { label: "NFT Volume", value: "$312M", change: "-8.3%", up: false },
            {
              label: "Layer 2 Activity",
              value: "High",
              change: "+22%",
              up: true,
            },
          ].map((t) => (
            <View key={t.label} style={styles.trendRow}>
              <Text style={styles.trendLabel}>{t.label}</Text>
              <View style={styles.trendRight}>
                <Text style={styles.trendValue}>{t.value}</Text>
                <Text
                  style={[
                    styles.trendChange,
                    { color: t.up ? "#10b981" : "#ef4444" },
                  ]}
                >
                  {t.change}
                </Text>
              </View>
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
  overviewCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  overviewLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  overviewValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 6,
  },
  overviewBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  overviewChange: { color: "#10b981", fontSize: 13, fontWeight: "600" },
  overviewRight: { alignItems: "flex-end" },
  overviewVolLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  overviewVol: { fontSize: 18, fontWeight: "700", color: "#e2e8f0" },
  timeframeRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tfBtn: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 8 },
  tfBtnActive: { backgroundColor: "#4f46e5" },
  tfText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  tfTextActive: { color: "#fff" },
  chartArea: { height: 120 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", flex: 1, gap: 4 },
  barWrapper: { flex: 1, justifyContent: "flex-end" },
  bar: { borderRadius: 3 },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  chartLabel: { color: "#475569", fontSize: 11 },
  sentimentRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sentimentCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sentimentLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "500",
  },
  sentimentValue: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  sentimentSub: { fontSize: 11, color: "#64748b" },
  moversCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  moversHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  moversTitle: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  moversTableHeader: {
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  colHeader: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  moverRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  coinIconText: { fontSize: 14, fontWeight: "800" },
  coinSymbol: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  coinName: { color: "#64748b", fontSize: 12 },
  coinPrice: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
  changePill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "flex-end",
  },
  changeText: { fontSize: 12, fontWeight: "700" },
  coinMktCap: { color: "#64748b", fontSize: 12, textAlign: "right" },
  rowDivider: { height: 1, backgroundColor: "#1e293b" },
  trendCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  trendTitle: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  trendLabel: { color: "#94a3b8", fontSize: 14 },
  trendRight: { alignItems: "flex-end" },
  trendValue: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  trendChange: { fontSize: 12, fontWeight: "600" },
});

export default MarketAnalysisScreen;
