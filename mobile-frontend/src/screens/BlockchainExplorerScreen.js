import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const latestTransactions = [
  {
    id: "1",
    hash: "0xabc123def456789",
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    to: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    value: "1.5 ETH",
    time: "2m ago",
    status: "success",
  },
  {
    id: "2",
    hash: "0xdef789abc012345",
    from: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    value: "0.8 ETH",
    time: "5m ago",
    status: "success",
  },
  {
    id: "3",
    hash: "0xghi456jkl789012",
    from: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    to: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
    value: "2.1 ETH",
    time: "8m ago",
    status: "pending",
  },
  {
    id: "4",
    hash: "0xjkl012mno345678",
    from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    to: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    value: "500 USDC",
    time: "12m ago",
    status: "success",
  },
];

const networkStats = [
  { label: "Latest Block", value: "#19,284,521", icon: "cube-outline" },
  { label: "Gas Price", value: "18 Gwei", icon: "flame-outline" },
  { label: "TPS", value: "14.2", icon: "flash-outline" },
  { label: "Nodes", value: "7,842", icon: "git-network-outline" },
];

const BlockchainExplorerScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setTimeout(() => {
      setSearchResult({
        type:
          searchQuery.startsWith("0x") && searchQuery.length > 30
            ? "address"
            : "transaction",
        query: searchQuery,
        balance: "4.821 ETH",
        txCount: 142,
        firstSeen: "Jan 12, 2024",
      });
      setIsSearching(false);
    }, 800);
  };

  const truncateHash = (hash) =>
    hash.length > 20 ? `${hash.substring(0, 10)}...${hash.slice(-8)}` : hash;

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.txCard}
      activeOpacity={0.75}
      testID={`tx-${item.id}`}
    >
      <View style={styles.txHeader}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                item.status === "success" ? "#10b981" : "#f59e0b",
            },
          ]}
        />
        <Text style={styles.txHash}>{truncateHash(item.hash)}</Text>
        <Text style={styles.txTime}>{item.time}</Text>
      </View>
      <View style={styles.txBody}>
        <View style={styles.txAddressRow}>
          <View style={styles.txAddressLabel}>
            <Text style={styles.txAddressTag}>FROM</Text>
          </View>
          <Text style={styles.txAddress} numberOfLines={1}>
            {item.from}
          </Text>
        </View>
        <View style={styles.txArrow}>
          <Ionicons name="arrow-down" size={14} color="#4f46e5" />
        </View>
        <View style={styles.txAddressRow}>
          <View style={styles.txAddressLabel}>
            <Text style={styles.txAddressTag}>TO</Text>
          </View>
          <Text style={styles.txAddress} numberOfLines={1}>
            {item.to}
          </Text>
        </View>
        <View style={styles.txValueRow}>
          <Text style={styles.txValue}>{item.value}</Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.status === "success" ? "#022c22" : "#1c1400",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "success" ? "#10b981" : "#f59e0b" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#64748b"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Address / Tx Hash / Block #"
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              testID="search-input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResult(null);
                }}
              >
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, isSearching && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={isSearching}
            testID="search-button"
          >
            <Text style={styles.searchBtnText}>
              {isSearching ? "Searching…" : "Search"}
            </Text>
          </TouchableOpacity>
        </View>

        {searchResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Ionicons
                name={
                  searchResult.type === "address"
                    ? "wallet-outline"
                    : "swap-horizontal-outline"
                }
                size={20}
                color="#6366f1"
              />
              <Text style={styles.resultType}>
                {searchResult.type === "address" ? "Address" : "Transaction"}
              </Text>
            </View>
            <Text style={styles.resultQuery} numberOfLines={1}>
              {searchResult.query}
            </Text>
            {searchResult.type === "address" && (
              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatLabel}>Balance</Text>
                  <Text style={styles.resultStatValue}>
                    {searchResult.balance}
                  </Text>
                </View>
                <View style={styles.resultStatDivider} />
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatLabel}>Transactions</Text>
                  <Text style={styles.resultStatValue}>
                    {searchResult.txCount}
                  </Text>
                </View>
                <View style={styles.resultStatDivider} />
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatLabel}>First Seen</Text>
                  <Text style={styles.resultStatValue}>
                    {searchResult.firstSeen}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.networkCard}>
          <View style={styles.networkHeader}>
            <Ionicons name="globe-outline" size={18} color="#0ea5e9" />
            <Text style={styles.networkTitle}>Network Status</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            {networkStats.map((stat) => (
              <View key={stat.label} style={styles.statCell}>
                <Ionicons name={stat.icon} size={20} color="#6366f1" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.txSection}>
          <View style={styles.txSectionHeader}>
            <Text style={styles.txSectionTitle}>Latest Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={latestTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  searchCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 48, color: "#f1f5f9", fontSize: 14 },
  searchBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  resultCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3730a3",
  },
  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  resultType: {
    color: "#818cf8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  resultQuery: {
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "monospace",
    marginBottom: 16,
  },
  resultStats: { flexDirection: "row", justifyContent: "space-around" },
  resultStat: { alignItems: "center" },
  resultStatLabel: { color: "#64748b", fontSize: 11, marginBottom: 4 },
  resultStatValue: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  resultStatDivider: { width: 1, backgroundColor: "#334155" },
  networkCard: {
    backgroundColor: "#082f49",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0c4a6e",
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  networkTitle: { fontSize: 15, fontWeight: "700", color: "#f8fafc", flex: 1 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#022c22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
  liveText: { color: "#10b981", fontSize: 10, fontWeight: "700" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCell: {
    width: "47%",
    backgroundColor: "#0f172a60",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statValue: { color: "#f1f5f9", fontSize: 16, fontWeight: "700" },
  statLabel: { color: "#64748b", fontSize: 11, textAlign: "center" },
  txSection: {},
  txSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  txSectionTitle: { fontSize: 16, fontWeight: "700", color: "#f8fafc" },
  viewAll: { color: "#6366f1", fontSize: 13, fontWeight: "600" },
  txCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  txHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  txHash: {
    flex: 1,
    color: "#818cf8",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  txTime: { color: "#475569", fontSize: 12 },
  txBody: {},
  txAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  txAddressLabel: {
    backgroundColor: "#334155",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  txAddressTag: { color: "#64748b", fontSize: 9, fontWeight: "700" },
  txAddress: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "monospace",
  },
  txArrow: { alignItems: "center", marginVertical: 2 },
  txValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  txValue: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
});

export default BlockchainExplorerScreen;
