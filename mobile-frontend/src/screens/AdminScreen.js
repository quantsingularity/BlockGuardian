import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const users = [
  {
    id: "1",
    name: "Alice Chen",
    email: "alice@example.com",
    role: "Admin",
    status: "active",
    joined: "Jan 2024",
  },
  {
    id: "2",
    name: "Bob Martinez",
    email: "bob@example.com",
    role: "User",
    status: "active",
    joined: "Feb 2024",
  },
  {
    id: "3",
    name: "Carol Smith",
    email: "carol@example.com",
    role: "Analyst",
    status: "suspended",
    joined: "Mar 2024",
  },
];

const auditLogs = [
  {
    id: "1",
    action: "User Login",
    user: "alice@example.com",
    time: "2m ago",
    level: "info",
  },
  {
    id: "2",
    action: "Security Scan",
    user: "bob@example.com",
    time: "15m ago",
    level: "info",
  },
  {
    id: "3",
    action: "Failed Login Attempt",
    user: "unknown@test.com",
    time: "1h ago",
    level: "warning",
  },
  {
    id: "4",
    action: "API Key Generated",
    user: "alice@example.com",
    time: "2h ago",
    level: "info",
  },
];

const LOG_COLORS = { info: "#6366f1", warning: "#f59e0b", error: "#ef4444" };

const TABS = ["Overview", "Users", "Settings", "Audit Log"];

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    twoFactorRequired: true,
    analyticsEnabled: true,
    rateLimit: true,
  });

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleUserAction = (user, action) => {
    Alert.alert(`${action} User`, `${action} ${user.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: action, style: action === "Delete" ? "destructive" : "default" },
    ]);
  };

  const renderOverview = () => (
    <>
      <View style={styles.statsGrid}>
        {[
          {
            label: "Total Users",
            value: "1,284",
            icon: "people",
            color: "#6366f1",
            bg: "#1e1b4b",
          },
          {
            label: "Active Now",
            value: "342",
            icon: "radio-button-on",
            color: "#10b981",
            bg: "#022c22",
          },
          {
            label: "Security Alerts",
            value: "7",
            icon: "warning",
            color: "#ef4444",
            bg: "#1c0a0a",
          },
          {
            label: "API Calls/h",
            value: "48.2K",
            icon: "flash",
            color: "#f59e0b",
            bg: "#1c1400",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.overviewCard,
              { backgroundColor: s.bg, borderColor: s.color + "30" },
            ]}
          >
            <Ionicons name={s.icon} size={22} color={s.color} />
            <Text style={[styles.overviewValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={styles.overviewLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.systemCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="server-outline" size={16} color="#6366f1" />
          <Text style={styles.sectionTitle}>System Health</Text>
        </View>
        {[
          { label: "API Server", status: "Online", ok: true },
          { label: "Database", status: "Online", ok: true },
          { label: "Blockchain Node", status: "Syncing", ok: false },
          { label: "Cache", status: "Online", ok: true },
        ].map((item) => (
          <View key={item.label} style={styles.healthRow}>
            <View
              style={[
                styles.healthDot,
                { backgroundColor: item.ok ? "#10b981" : "#f59e0b" },
              ]}
            />
            <Text style={styles.healthLabel}>{item.label}</Text>
            <Text
              style={[
                styles.healthStatus,
                { color: item.ok ? "#10b981" : "#f59e0b" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderUsers = () => (
    <View style={styles.usersCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="people-outline" size={16} color="#6366f1" />
        <Text style={styles.sectionTitle}>User Management</Text>
        <TouchableOpacity style={styles.addUserBtn}>
          <Ionicons name="add" size={16} color="#6366f1" />
          <Text style={styles.addUserText}>Add User</Text>
        </TouchableOpacity>
      </View>
      {users.map((user, i) => (
        <View key={user.id}>
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.name[0]}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.userRole}>{user.role}</Text>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        user.status === "active" ? "#10b981" : "#ef4444",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.userStatus,
                    { color: user.status === "active" ? "#10b981" : "#ef4444" },
                  ]}
                >
                  {user.status}
                </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => handleUserAction(user, "Edit")}
              >
                <Ionicons name="pencil-outline" size={16} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionIcon, { backgroundColor: "#1c0a0a" }]}
                onPress={() => handleUserAction(user, "Delete")}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
          {i < users.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="settings-outline" size={16} color="#6366f1" />
        <Text style={styles.sectionTitle}>System Settings</Text>
      </View>
      {[
        {
          key: "maintenanceMode",
          label: "Maintenance Mode",
          desc: "Disable access for non-admins",
          danger: true,
        },
        {
          key: "twoFactorRequired",
          label: "Require 2FA",
          desc: "Force two-factor authentication for all users",
        },
        {
          key: "analyticsEnabled",
          label: "Enable Analytics",
          desc: "Collect usage analytics",
        },
        {
          key: "rateLimit",
          label: "API Rate Limiting",
          desc: "Limit API requests per user",
        },
      ].map((setting, i, arr) => (
        <View key={setting.key}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text
                style={[
                  styles.settingLabel,
                  setting.danger &&
                    settings[setting.key] && { color: "#ef4444" },
                ]}
              >
                {setting.label}
              </Text>
              <Text style={styles.settingDesc}>{setting.desc}</Text>
            </View>
            <Switch
              value={settings[setting.key]}
              onValueChange={() => toggleSetting(setting.key)}
              trackColor={{
                false: "#334155",
                true: setting.danger ? "#7f1d1d" : "#3730a3",
              }}
              thumbColor={
                settings[setting.key]
                  ? setting.danger
                    ? "#ef4444"
                    : "#6366f1"
                  : "#94a3b8"
              }
            />
          </View>
          {i < arr.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );

  const renderAuditLog = () => (
    <View style={styles.auditCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={16} color="#6366f1" />
        <Text style={styles.sectionTitle}>Audit Log</Text>
      </View>
      {auditLogs.map((log, i) => (
        <View key={log.id}>
          <View style={styles.logRow}>
            <View
              style={[
                styles.logDot,
                { backgroundColor: LOG_COLORS[log.level] },
              ]}
            />
            <View style={styles.logInfo}>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.logUser}>{log.user}</Text>
            </View>
            <Text style={styles.logTime}>{log.time}</Text>
          </View>
          {i < auditLogs.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "Overview" && renderOverview()}
        {activeTab === "Users" && renderUsers()}
        {activeTab === "Settings" && renderSettings()}
        {activeTab === "Audit Log" && renderAuditLog()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#6366f1" },
  tabText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#6366f1" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  overviewCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  overviewValue: { fontSize: 22, fontWeight: "800" },
  overviewLabel: { color: "#64748b", fontSize: 12, textAlign: "center" },
  systemCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#f8fafc", flex: 1 },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthLabel: { flex: 1, color: "#94a3b8", fontSize: 14 },
  healthStatus: { fontSize: 13, fontWeight: "600" },
  usersCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  addUserBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addUserText: { color: "#6366f1", fontSize: 13, fontWeight: "600" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: "#818cf8", fontSize: 16, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: {
    color: "#f1f5f9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: { color: "#64748b", fontSize: 12, marginBottom: 4 },
  userMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  userRole: {
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  userStatus: { fontSize: 11, textTransform: "capitalize" },
  userActions: { flexDirection: "row", gap: 8 },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "#334155" },
  settingsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    color: "#f1f5f9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDesc: { color: "#64748b", fontSize: 12 },
  auditCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 12,
  },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  logInfo: { flex: 1 },
  logAction: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  logUser: { color: "#64748b", fontSize: 12 },
  logTime: { color: "#475569", fontSize: 12 },
});

export default AdminScreen;
