import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

const truncateHash = (hash) => {
  if (!hash || hash.length <= 16) return hash || "";
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
};

const TransactionItem = ({ item, onPress }) => {
  const isReceived = item.type === "received";

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress?.(item)}
      activeOpacity={0.75}
      testID={`tx-item-${item.hash}`}
    >
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: isReceived ? "#022c22" : "#1c0a0a" },
          ]}
        >
          <Ionicons
            name={isReceived ? "arrow-down-outline" : "arrow-up-outline"}
            size={18}
            color={isReceived ? "#10b981" : "#ef4444"}
          />
        </View>
        <View style={styles.itemMeta}>
          <Text style={styles.itemType}>
            {isReceived ? "Received" : "Sent"}
          </Text>
          <Text style={styles.itemDate}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.amountWrap}>
          <Text
            style={[
              styles.amount,
              { color: isReceived ? "#10b981" : "#ef4444" },
            ]}
          >
            {isReceived ? "+" : "-"}
            {item.amount}
          </Text>
        </View>
      </View>

      <View style={styles.hashRow}>
        <Ionicons name="receipt-outline" size={12} color="#475569" />
        <Text style={styles.hash}>{truncateHash(item.hash)}</Text>
        {item.status && (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.status === "confirmed" ? "#022c22" : "#1c1400",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "confirmed" ? "#10b981" : "#f59e0b" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.empty}>
    <Ionicons name="document-outline" size={48} color="#334155" />
    <Text style={styles.emptyTitle}>No Transactions</Text>
    <Text style={styles.emptySub}>
      Your transaction history will appear here
    </Text>
  </View>
);

const TransactionList = ({
  transactions = [],
  onTransactionPress,
  loading = false,
  style,
  testID,
}) => {
  return (
    <View style={[styles.root, style]} testID={testID}>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem item={item} onPress={onTransactionPress} />
        )}
        keyExtractor={(item) => item.hash || String(Math.random())}
        ListEmptyComponent={loading ? null : <EmptyState />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {},
  item: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemMeta: { flex: 1 },
  itemType: {
    color: "#f1f5f9",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  itemDate: { color: "#64748b", fontSize: 12 },
  amountWrap: { alignItems: "flex-end" },
  amount: { fontSize: 15, fontWeight: "700" },
  hashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f172a60",
    borderRadius: 8,
    padding: 8,
  },
  hash: { flex: 1, color: "#64748b", fontSize: 12, fontFamily: "monospace" },
  statusPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyTitle: { color: "#475569", fontSize: 16, fontWeight: "600" },
  emptySub: { color: "#334155", fontSize: 13, textAlign: "center" },
  separator: { height: 10 },
});

export default TransactionList;
