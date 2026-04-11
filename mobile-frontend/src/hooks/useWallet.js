import { useCallback, useEffect, useState } from "react";

const useWallet = (provider) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!provider?.isConnected || !provider.address) {
      return;
    }
    try {
      const mockBalance = "1.234";
      setBalance(mockBalance);
      return mockBalance;
    } catch (err) {
      console.error("Balance fetch error:", err);
      setError(err.message || "Failed to fetch balance");
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      setIsConnected(provider.isConnected || false);
      setAddress(provider.address || null);
      setChainId(provider.chainId || null);

      if (provider.isConnected && provider.address) {
        fetchBalance();
      }
    }
  }, [provider, fetchBalance]);

  const connect = async () => {
    if (!provider) {
      setError("Wallet provider not available");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await provider.open();
      setIsConnected(provider.isConnected || false);
      setAddress(provider.address || null);
      setChainId(provider.chainId || null);
      if (provider.isConnected && provider.address) {
        await fetchBalance();
      }
      return { success: true, address: provider.address };
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    if (!provider) {
      setError("Wallet provider not available");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await provider.disconnect();
      setIsConnected(false);
      setAddress(null);
      setChainId(null);
      setBalance("0");
      return { success: true };
    } catch (err) {
      console.error("Wallet disconnection error:", err);
      setError(err.message || "Failed to disconnect wallet");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr = address) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return {
    isConnected,
    address,
    chainId,
    balance,
    isLoading,
    error,
    connect,
    disconnect,
    fetchBalance,
    formatAddress,
  };
};

export default useWallet;
