import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import Web3Modal from "web3modal";

export const WalletContext = React.createContext();

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "BlockGuardian",
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions,
    theme: "dark",
  });
}

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [library, setLibrary] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);

  const updateBalance = useCallback(
    async (address) => {
      if (library) {
        try {
          const bal = await library.getBalance(address);
          setBalance(ethers.utils.formatEther(bal));
        } catch (err) {
          console.error("Error updating balance:", err);
        }
      }
    },
    [library],
  );

  const connectWallet = useCallback(async () => {
    try {
      const web3Provider = await web3Modal.connect();
      const lib = new ethers.providers.Web3Provider(web3Provider);
      const accounts = await lib.listAccounts();
      const net = await lib.getNetwork();

      setProvider(web3Provider);
      setLibrary(lib);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const bal = await lib.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(bal));
      }

      setNetwork(net.name);
      setChainId(net.chainId);
      setConnected(true);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Connection error:", err);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await web3Modal.clearCachedProvider();
      setProvider(null);
      setLibrary(null);
      setAccount(null);
      setNetwork(null);
      setChainId(null);
      setConnected(false);
      setBalance(null);
    } catch (err) {
      setError(err);
      console.error("Disconnection error:", err);
    }
  }, []);

  const switchNetwork = useCallback(
    async (targetChainId) => {
      try {
        if (!provider) return;
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
        });
      } catch (err) {
        setError(err);
        console.error("Network switch error:", err);
      }
    },
    [provider],
  );

  const handleAccountsChanged = useCallback(
    (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      } else {
        setAccount(null);
        setBalance(null);
      }
    },
    [updateBalance],
  );

  const handleChainChanged = useCallback(
    (newChainId) => {
      const parsedChainId = parseInt(newChainId, 16);
      setChainId(parsedChainId);

      const networkMap = {
        1: "mainnet",
        5: "goerli",
        11155111: "sepolia",
        137: "polygon",
        42161: "arbitrum",
        10: "optimism",
        8453: "base",
      };
      setNetwork(networkMap[parsedChainId] || `chain-${parsedChainId}`);

      if (account) {
        updateBalance(account);
      }
    },
    [account, updateBalance],
  );

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet]);

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", disconnectWallet);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", disconnectWallet);
        }
      };
    }
  }, [provider, disconnectWallet, handleAccountsChanged, handleChainChanged]);

  const getContract = useCallback(
    (address, abi) => {
      if (!library) return null;
      return new ethers.Contract(address, abi, library.getSigner());
    },
    [library],
  );

  const callContractMethod = useCallback(async (contract, method, ...args) => {
    try {
      return await contract[method](...args);
    } catch (err) {
      setError(err);
      console.error(`Error calling ${method}:`, err);
      throw err;
    }
  }, []);

  const sendTransaction = useCallback(async (contract, method, ...args) => {
    try {
      const tx = await contract[method](...args);
      return await tx.wait();
    } catch (err) {
      setError(err);
      console.error(`Error in transaction ${method}:`, err);
      throw err;
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getContract,
        callContractMethod,
        sendTransaction,
        updateBalance,
        provider,
        library,
        account,
        network,
        chainId,
        connected,
        error,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
