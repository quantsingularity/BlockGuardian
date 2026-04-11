import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RISK_COLORS, RISK_LEVELS } from "../lib/constants";

const RISK_CONFIG = {
  [RISK_LEVELS.LOW]: {
    icon: "checkmark-circle",
    color: RISK_COLORS[RISK_LEVELS.LOW],
    bg: "#022c22",
    border: "#064e3b",
    label: "Low Risk",
  },
  [RISK_LEVELS.MEDIUM]: {
    icon: "alert-circle",
    color: RISK_COLORS[RISK_LEVELS.MEDIUM],
    bg: "#1c1400",
    border: "#78350f",
    label: "Medium Risk",
  },
  [RISK_LEVELS.HIGH]: {
    icon: "warning",
    color: RISK_COLORS[RISK_LEVELS.HIGH],
    bg: "#1a0a00",
    border: "#9a3412",
    label: "High Risk",
  },
  [RISK_LEVELS.CRITICAL]: {
    icon: "close-circle",
    color: RISK_COLORS[RISK_LEVELS.CRITICAL],
    bg: "#1c0a0a",
    border: "#7f1d1d",
    label: "Critical Risk",
  },
};

const SecurityCheckScreen = () => {
  const [addressToCheck, setAddressToCheck] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentChecks, setRecentChecks] = useState([]);

  const handleCheckAddress = () => {
    if (!addressToCheck.trim()) {
      Alert.alert("Input Required", "Please enter an address to check.");
      return;
    }
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      let scanResult;
      if (addressToCheck.length < 10) {
        scanResult = {
          risk: RISK_LEVELS.CRITICAL,
          message:
            "Invalid address format. A valid address must be at least 10 characters.",
          address: addressToCheck,
          scannedAt: new Date().toLocaleTimeString(),
        };
      } else if (addressToCheck.toLowerCase().startsWith("0xbad")) {
        scanResult = {
          risk: RISK_LEVELS.HIGH,
          message:
            "This address is associated with potentially risky activity. Proceed with caution.",
          address: addressToCheck,
          scannedAt: new Date().toLocaleTimeString(),
        };
      } else if (addressToCheck.toLowerCase().startsWith("0x000")) {
        scanResult = {
          risk: RISK_LEVELS.MEDIUM,
          message:
            "Unusual address pattern detected. Review transaction history before interacting.",
          address: addressToCheck,
          scannedAt: new Date().toLocaleTimeString(),
        };
      } else {
        scanResult = {
          risk: RISK_LEVELS.LOW,
          message:
            "No immediate risks detected. Always verify addresses before sending funds.",
          address: addressToCheck,
          scannedAt: new Date().toLocaleTimeString(),
        };
      }
      setResult(scanResult);
      setRecentChecks((prev) => [scanResult, ...prev].slice(0, 5));
      setIsLoading(false);
    }, 1500);
  };

  const config = result ? RISK_CONFIG[result.risk] : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#10b981" />
          </View>
          <Text style={styles.heroTitle}>Security Scanner</Text>
          <Text style={styles.heroSub}>
            Analyze any blockchain address for threats
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Wallet / Contract Address</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#64748b"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="0x..."
              placeholderTextColor="#475569"
              value={addressToCheck}
              onChangeText={(t) => {
                setAddressToCheck(t);
                setResult(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              testID="address-input"
            />
            {addressToCheck.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setAddressToCheck("");
                  setResult(null);
                }}
              >
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.scanBtn, isLoading && styles.scanBtnDisabled]}
            onPress={handleCheckAddress}
            disabled={isLoading}
            testID="scan-button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.scanBtnText}>Scan Address</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Scanning blockchain data...</Text>
            <Text style={styles.loadingSub}>
              Checking known threat databases
            </Text>
          </View>
        )}

        {result && config && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: config.bg, borderColor: config.border },
            ]}
          >
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIconWrap,
                  { backgroundColor: config.color + "20" },
                ]}
              >
                <Ionicons name={config.icon} size={28} color={config.color} />
              </View>
              <View style={styles.resultMeta}>
                <Text style={styles.resultScanLabel}>Scan Complete</Text>
                <Text style={[styles.resultRisk, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
              <View
                style={[
                  styles.resultBadge,
                  {
                    backgroundColor: config.color + "20",
                    borderColor: config.color + "40",
                  },
                ]}
              >
                <Text style={[styles.resultBadgeText, { color: config.color }]}>
                  {result.risk.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.resultAddress}>
              <Text style={styles.resultAddressLabel}>Address Scanned</Text>
              <Text style={styles.resultAddressValue} numberOfLines={1}>
                {result.address}
              </Text>
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>

            <View style={styles.resultFooter}>
              <Ionicons name="time-outline" size={13} color="#64748b" />
              <Text style={styles.resultTime}>
                Scanned at {result.scannedAt}
              </Text>
            </View>
          </View>
        )}

        {recentChecks.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Scans</Text>
            {recentChecks.map((check, i) => {
              const cfg = RISK_CONFIG[check.risk];
              return (
                <View key={i} style={styles.historyItem}>
                  <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                  <Text style={styles.historyAddress} numberOfLines={1}>
                    {check.address.length > 20
                      ? `${check.address.substring(0, 10)}...${check.address.slice(-6)}`
                      : check.address}
                  </Text>
                  <Text style={[styles.historyRisk, { color: cfg.color }]}>
                    {check.risk.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: "#022c22",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#064e3b",
    marginBottom: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#064e3b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 4,
  },
  heroSub: { fontSize: 13, color: "#64748b", textAlign: "center" },
  inputCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 50,
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "monospace",
  },
  scanBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnDisabled: { opacity: 0.6 },
  scanBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  loadingCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    gap: 12,
  },
  loadingText: { color: "#e2e8f0", fontSize: 15, fontWeight: "600" },
  loadingSub: { color: "#64748b", fontSize: 13 },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  resultIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultMeta: { flex: 1 },
  resultScanLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultRisk: { fontSize: 18, fontWeight: "800" },
  resultBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  resultBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  resultAddress: {
    backgroundColor: "#0f172a40",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  resultAddressLabel: { fontSize: 11, color: "#64748b", marginBottom: 4 },
  resultAddressValue: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "monospace",
  },
  resultMessage: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  resultFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultTime: { color: "#64748b", fontSize: 12 },
  historySection: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  historyAddress: {
    flex: 1,
    color: "#cbd5e1",
    fontSize: 13,
    fontFamily: "monospace",
  },
  historyRisk: { fontSize: 11, fontWeight: "700" },
});

export default SecurityCheckScreen;
