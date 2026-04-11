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
import { RISK_COLORS, RISK_LEVELS } from "../lib/constants";

const CATEGORIES = ["All", "Security", "Investment", "Portfolio"];

const recommendations = [
  {
    id: "1",
    type: "Investment",
    title: "Consider diversifying into DeFi",
    description:
      "AI analysis suggests potential growth in decentralized finance protocols. ETH staking and lending platforms show strong fundamentals.",
    risk: RISK_LEVELS.MEDIUM,
    icon: "cash",
    confidence: 78,
    action: "Explore DeFi",
  },
  {
    id: "2",
    type: "Security",
    title: "Review Smart Contract Permissions",
    description:
      "An unused permission for a DApp was detected. Review and revoke if necessary to reduce attack surface.",
    risk: RISK_LEVELS.LOW,
    icon: "shield-checkmark",
    confidence: 95,
    action: "Review Now",
  },
  {
    id: "3",
    type: "Investment",
    title: "Potential Undervalued Asset: SOL",
    description:
      "Based on recent on-chain activity and market sentiment, Solana shows potential for recovery with strong ecosystem growth.",
    risk: RISK_LEVELS.HIGH,
    icon: "trending-up",
    confidence: 61,
    action: "View Analysis",
  },
  {
    id: "4",
    type: "Security",
    title: "Phishing Alert: Fake Airdrop",
    description:
      "A known phishing scam related to a fake airdrop is circulating. Do not connect your wallet to any unsolicited links.",
    risk: RISK_LEVELS.CRITICAL,
    icon: "warning",
    confidence: 99,
    action: "View Alert",
  },
  {
    id: "5",
    type: "Portfolio",
    title: "Rebalance Recommended",
    description:
      "Your BTC allocation has grown to 58% of portfolio. Consider rebalancing to maintain your target allocation of 40%.",
    risk: RISK_LEVELS.LOW,
    icon: "pie-chart",
    confidence: 88,
    action: "Rebalance",
  },
];

const RISK_BG = {
  [RISK_LEVELS.LOW]: "#022c22",
  [RISK_LEVELS.MEDIUM]: "#1c1400",
  [RISK_LEVELS.HIGH]: "#1a0a00",
  [RISK_LEVELS.CRITICAL]: "#1c0a0a",
};

const RISK_BORDER = {
  [RISK_LEVELS.LOW]: "#064e3b",
  [RISK_LEVELS.MEDIUM]: "#78350f",
  [RISK_LEVELS.HIGH]: "#9a3412",
  [RISK_LEVELS.CRITICAL]: "#7f1d1d",
};

const AIRecommendationsScreen = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? recommendations
      : recommendations.filter((r) => r.type === activeCategory);

  const overallRisk = RISK_LEVELS.MEDIUM;
  const overallScore = 72;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>AI Risk Score</Text>
            <Text style={styles.scoreValue}>{overallScore}/100</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${overallScore}%`,
                    backgroundColor: RISK_COLORS[overallRisk],
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.scoreSentiment,
                { color: RISK_COLORS[overallRisk] },
              ]}
            >
              {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
              Portfolio
            </Text>
          </View>
          <View style={styles.scoreRight}>
            <View style={styles.scoreRingOuter}>
              <View
                style={[
                  styles.scoreRingInner,
                  { borderColor: RISK_COLORS[overallRisk] },
                ]}
              >
                <Ionicons
                  name="bulb"
                  size={28}
                  color={RISK_COLORS[overallRisk]}
                />
              </View>
            </View>
            <Text style={styles.insightCount}>
              {recommendations.length} insights
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            {
              label: "Opportunities",
              value: "3",
              icon: "trending-up",
              color: "#10b981",
            },
            {
              label: "Security Alerts",
              value: "2",
              icon: "shield-outline",
              color: "#ef4444",
            },
            {
              label: "Avg Confidence",
              value: "84%",
              icon: "analytics-outline",
              color: "#6366f1",
            },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={18} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catBtn,
                activeCategory === cat && styles.catBtnActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.recCard,
              {
                backgroundColor: RISK_BG[item.risk],
                borderColor: RISK_BORDER[item.risk],
              },
            ]}
            activeOpacity={0.8}
            testID={`rec-${item.id}`}
          >
            <View style={styles.recHeader}>
              <View
                style={[
                  styles.recIconWrap,
                  { backgroundColor: RISK_COLORS[item.risk] + "20" },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={RISK_COLORS[item.risk]}
                />
              </View>
              <View style={styles.recMeta}>
                <View style={styles.recTypeRow}>
                  <Text style={styles.recType}>{item.type}</Text>
                  <View
                    style={[
                      styles.riskTag,
                      { backgroundColor: RISK_COLORS[item.risk] + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskTagText,
                        { color: RISK_COLORS[item.risk] },
                      ]}
                    >
                      {item.risk.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </View>

            <Text style={styles.recDesc}>{item.description}</Text>

            <View style={styles.recFooter}>
              <View style={styles.confidenceWrap}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${item.confidence}%`,
                        backgroundColor: RISK_COLORS[item.risk],
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.confidenceVal,
                    { color: RISK_COLORS[item.risk] },
                  ]}
                >
                  {item.confidence}%
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { borderColor: RISK_COLORS[item.risk] + "60" },
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: RISK_COLORS[item.risk] },
                  ]}
                >
                  {item.action}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={RISK_COLORS[item.risk]}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  scoreCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 10,
  },
  scoreBar: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  scoreSentiment: { fontSize: 13, fontWeight: "600" },
  scoreRight: { alignItems: "center", gap: 8 },
  scoreRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  insightCount: { color: "#64748b", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#64748b", textAlign: "center" },
  categoryScroll: { marginBottom: 16 },
  categoryRow: { gap: 8, paddingRight: 4 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  catBtnActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  catText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  catTextActive: { color: "#fff" },
  recCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  recHeader: { flexDirection: "row", gap: 12, marginBottom: 10 },
  recIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  recMeta: { flex: 1, justifyContent: "center" },
  recTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  recType: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  riskTag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  riskTagText: { fontSize: 10, fontWeight: "700" },
  recTitle: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  recDesc: { color: "#94a3b8", fontSize: 13, lineHeight: 18, marginBottom: 14 },
  recFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
  confidenceWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceLabel: { color: "#475569", fontSize: 11, width: 64 },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#1e293b80",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceFill: { height: "100%", borderRadius: 2 },
  confidenceVal: { fontSize: 11, fontWeight: "700", width: 32 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" },
});

export default AIRecommendationsScreen;
