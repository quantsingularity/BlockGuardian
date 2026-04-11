import "react-native-get-random-values";
import "@walletconnect/react-native-compat";
import { WalletConnectModal } from "@walletconnect/modal-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";

const projectId =
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "demo-project-id-change-this";

const providerMetadata = {
  name: process.env.EXPO_PUBLIC_APP_NAME || "BlockGuardian Mobile",
  description:
    "BlockGuardian Mobile App - Secure your crypto assets and monitor blockchain security.",
  url: process.env.EXPO_PUBLIC_APP_URL || "https://blockguardian.io",
  icons: [
    process.env.EXPO_PUBLIC_APP_ICON_URL || "https://blockguardian.io/icon.png",
  ],
  redirect: {
    native: `${process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || "blockguardian"}://`,
    universal: process.env.EXPO_PUBLIC_APP_URL || "https://blockguardian.io",
  },
};

const sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
      chains: ["eip155:1"],
      events: ["accountsChanged", "chainChanged"],
      rpcMap: {},
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
        sessionParams={sessionParams}
      />
    </SafeAreaProvider>
  );
}
