import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { WalletConnectModal, IProviderMetadata, SessionParams } from '@walletconnect/modal-react-native';

// --- WalletConnect Configuration ---
// IMPORTANT: You need to replace '<YOUR_PROJECT_ID>' with your actual Project ID
// obtained from WalletConnect Cloud (https://cloud.walletconnect.com/)
const projectId = '<YOUR_PROJECT_ID>';

const providerMetadata: IProviderMetadata = {
  name: 'BlockGuardian Mobile',
  description: 'BlockGuardian Mobile App - Secure your crypto assets.',
  url: 'https://yourapp.com/', // Replace with your app's URL
  icons: ['https://yourapp.com/icon.png'], // Replace with your app's icon URL
  redirect: {
    native: 'blockguardian://', // Replace with your app's deep link scheme
    universal: 'https://yourapp.com' // Replace with your app's universal link
  }
};

// Optional: Define session parameters if needed
// const sessionParams: SessionParams = {
//   namespaces: {
//     eip155: {
//       methods: ['eth_sendTransaction', 'personal_sign'],
//       chains: ['eip155:1'], // Example: Ethereum Mainnet
//       events: ['accountsChanged', 'chainChanged'],
//     },
//   },
// };
// --- End WalletConnect Configuration ---

export default function App() {
  return (
    <>
      <AppNavigator />
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
        // sessionParams={sessionParams} // Uncomment if you defined sessionParams
        // Other optional props like `themeMode`, `accentColor`, etc.
      />
    </>
  );
}
