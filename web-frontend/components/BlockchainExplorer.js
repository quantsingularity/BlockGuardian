import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";

const BlockchainExplorer = () => {
  const { library, account, network, chainId, connected } = useWallet();

  const [view, setView] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("address");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  const contractAddresses = useMemo(
    () => ({
      TokenizedAsset: "0x123...",
      PortfolioManager: "0x456...",
      TradingPlatform: "0x789...",
      DeFiIntegration: "0xabc...",
    }),
    [],
  );

  const fetchRecentTransactions = useCallback(async () => {
    if (!library || !connected) return;

    try {
      setLoading(true);
      setError(null);

      const blockNumber = await library.getBlockNumber();

      const blockPromises = [];
      for (let i = 0; i < 10; i++) {
        if (blockNumber - i >= 0) {
          blockPromises.push(library.getBlockWithTransactions(blockNumber - i));
        }
      }

      const fetchedBlocks = await Promise.all(blockPromises);

      let allTransactions = [];
      fetchedBlocks.forEach((block) => {
        if (!block) return;
        const txsWithTimestamp = block.transactions.map((tx) => ({
          ...tx,
          blockTimestamp: new Date(block.timestamp * 1000),
          blockNumber: block.number,
        }));
        allTransactions = [...allTransactions, ...txsWithTimestamp];
      });

      allTransactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp);
      setTransactions(allTransactions.slice(0, 20));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch recent transactions");
      setLoading(false);
    }
  }, [library, connected]);

  const fetchRecentBlocks = useCallback(async () => {
    if (!library || !connected) return;

    try {
      setLoading(true);
      setError(null);

      const blockNumber = await library.getBlockNumber();

      const blockPromises = [];
      for (let i = 0; i < 10; i++) {
        if (blockNumber - i >= 0) {
          blockPromises.push(library.getBlock(blockNumber - i));
        }
      }

      const fetchedBlocks = await Promise.all(blockPromises);
      setBlocks(fetchedBlocks.filter(Boolean));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setError("Failed to fetch recent blocks");
      setLoading(false);
    }
  }, [library, connected]);

  const fetchContractData = useCallback(
    async (contractAddress) => {
      if (!library || !connected || !contractAddress) return;

      try {
        setLoading(true);
        setError(null);

        const code = await library.getCode(contractAddress);
        const txCount = await library.getTransactionCount(contractAddress);
        const bal = await library.getBalance(contractAddress);

        setContractData({
          address: contractAddress,
          code: code,
          codeSize: (code.length - 2) / 2,
          txCount: txCount,
          balance: ethers.utils.formatEther(bal),
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract data:", err);
        setError("Failed to fetch contract data");
        setLoading(false);
      }
    },
    [library, connected],
  );

  const handleSearch = async () => {
    if (!searchQuery || !library || !connected) return;

    try {
      setSearchLoading(true);
      setError(null);

      let result = null;

      if (searchType === "address") {
        if (!ethers.utils.isAddress(searchQuery)) {
          throw new Error("Invalid Ethereum address");
        }

        const code = await library.getCode(searchQuery);
        const txCount = await library.getTransactionCount(searchQuery);
        const bal = await library.getBalance(searchQuery);

        result = {
          type: "address",
          address: searchQuery,
          isContract: code !== "0x",
          txCount: txCount,
          balance: ethers.utils.formatEther(bal),
        };

        if (code !== "0x") {
          result.codeSize = (code.length - 2) / 2;
        }
      } else if (searchType === "tx") {
        const tx = await library.getTransaction(searchQuery);

        if (!tx) {
          throw new Error("Transaction not found");
        }

        const receipt = await library.getTransactionReceipt(searchQuery);
        const block = await library.getBlock(tx.blockNumber);

        result = {
          type: "transaction",
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.utils.formatEther(tx.value),
          blockNumber: tx.blockNumber,
          timestamp: block ? new Date(block.timestamp * 1000) : null,
          status: receipt ? (receipt.status ? "Success" : "Failed") : "Pending",
          gasUsed: receipt ? receipt.gasUsed.toString() : "N/A",
        };
      } else if (searchType === "block") {
        const blockNumber = parseInt(searchQuery, 10);

        if (Number.isNaN(blockNumber)) {
          throw new Error("Invalid block number");
        }

        const block = await library.getBlock(blockNumber);

        if (!block) {
          throw new Error("Block not found");
        }

        result = {
          type: "block",
          number: block.number,
          hash: block.hash,
          timestamp: new Date(block.timestamp * 1000),
          transactions: block.transactions.length,
          gasUsed: block.gasUsed.toString(),
          gasLimit: block.gasLimit.toString(),
          miner: block.miner,
        };
      } else if (searchType === "token") {
        if (!ethers.utils.isAddress(searchQuery)) {
          throw new Error("Invalid token address");
        }

        const erc20Interface = new ethers.utils.Interface([
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
          "function totalSupply() view returns (uint256)",
        ]);

        const tokenContract = new ethers.Contract(
          searchQuery,
          erc20Interface,
          library,
        );

        try {
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.totalSupply(),
          ]);

          result = {
            type: "token",
            address: searchQuery,
            name: name,
            symbol: symbol,
            decimals: decimals,
            totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
          };
        } catch (_err) {
          throw new Error("Not a valid ERC20 token");
        }
      }

      setSearchResults(result);
      setSearchLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
      setSearchResults(null);
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    if (view === "transactions") {
      fetchRecentTransactions();
    } else if (view === "blocks") {
      fetchRecentBlocks();
    } else if (view === "contracts") {
      const firstContract = Object.values(contractAddresses)[0];
      if (firstContract) {
        fetchContractData(firstContract);
      }
    }
  }, [
    view,
    contractAddresses,
    fetchContractData,
    fetchRecentBlocks,
    fetchRecentTransactions,
  ]);

  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Wallet Not Connected
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Please connect your wallet to use the blockchain explorer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Blockchain Explorer
      </h2>

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Network:{" "}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {network
                ? network.charAt(0).toUpperCase() + network.slice(1)
                : "Unknown"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Chain ID:{" "}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {chainId || "Unknown"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Connected Account:{" "}
            </span>
            <span className="font-medium text-gray-900 dark:text-white font-mono">
              {account ? formatAddress(account) : "None"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by address, transaction hash, block number, or token address"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="address">Address</option>
              <option value="tx">Transaction</option>
              <option value="block">Block</option>
              <option value="token">Token</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {searchResults && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Search Results
          </h3>

          {searchResults.type === "address" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Address:
                </span>
                <span className="font-mono text-gray-900 dark:text-white break-all">
                  {searchResults.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.isContract
                    ? "Contract"
                    : "EOA (Externally Owned Account)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Balance:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.balance} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Transaction Count:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.txCount}
                </span>
              </div>
              {searchResults.isContract && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Code Size:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {searchResults.codeSize} bytes
                  </span>
                </div>
              )}
            </div>
          )}

          {searchResults.type === "transaction" && (
            <div className="space-y-2">
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-gray-500 dark:text-gray-400">Hash:</span>
                <span className="font-mono text-gray-900 dark:text-white text-sm break-all">
                  {searchResults.hash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">From:</span>
                <span className="font-mono text-gray-900 dark:text-white text-sm">
                  {searchResults.from}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">To:</span>
                <span className="font-mono text-gray-900 dark:text-white text-sm">
                  {searchResults.to || "Contract Creation"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Value:</span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.value} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Block:</span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.blockNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Timestamp:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatTimestamp(searchResults.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`font-medium ${
                    searchResults.status === "Success"
                      ? "text-green-600 dark:text-green-400"
                      : searchResults.status === "Failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {searchResults.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Gas Used:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.gasUsed}
                </span>
              </div>
            </div>
          )}

          {searchResults.type === "block" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Block Number:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.number}
                </span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-gray-500 dark:text-gray-400">Hash:</span>
                <span className="font-mono text-gray-900 dark:text-white text-sm break-all">
                  {searchResults.hash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Timestamp:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatTimestamp(searchResults.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Transactions:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.transactions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Gas Used:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.gasUsed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Gas Limit:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.gasLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Miner:</span>
                <span className="font-mono text-gray-900 dark:text-white text-sm">
                  {searchResults.miner}
                </span>
              </div>
            </div>
          )}

          {searchResults.type === "token" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Token Address:
                </span>
                <span className="font-mono text-gray-900 dark:text-white text-sm break-all">
                  {searchResults.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Symbol:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Decimals:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.decimals}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Supply:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {searchResults.totalSupply}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {["transactions", "blocks", "contracts"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-medium capitalize ${
                view === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setView(tab)}
            >
              {tab === "contracts"
                ? "Smart Contracts"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {view === "transactions" && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["Hash", "Block", "From", "To", "Value", "Timestamp"].map(
                  (col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <tr
                    key={`${tx.hash}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 dark:text-indigo-400">
                      {formatAddress(tx.hash)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tx.blockNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {formatAddress(tx.from)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {tx.to ? formatAddress(tx.to) : "Contract Creation"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ethers.utils.formatEther(tx.value)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(tx.blockTimestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "blocks" && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  "Number",
                  "Hash",
                  "Timestamp",
                  "Transactions",
                  "Gas Used",
                  "Gas Limit",
                ].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {blocks.length > 0 ? (
                blocks.map((block, index) => (
                  <tr
                    key={`${block.number}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {block.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {formatAddress(block.hash)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(new Date(block.timestamp * 1000))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {block.transactions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {block.gasUsed.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {block.gasLimit.toString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No blocks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "contracts" && !loading && (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Contract
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              onChange={(e) => fetchContractData(e.target.value)}
              defaultValue={Object.values(contractAddresses)[0]}
            >
              {Object.entries(contractAddresses).map(([name, address]) => (
                <option key={address} value={address}>
                  {name} ({formatAddress(address)})
                </option>
              ))}
            </select>
          </div>

          {contractData && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Contract Details
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Address:
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white text-sm break-all">
                    {contractData.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Balance:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {contractData.balance} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Transaction Count:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {contractData.txCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Code Size:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {contractData.codeSize} bytes
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">
                  Contract Bytecode
                </h4>
                <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-48">
                  <pre className="text-xs font-mono text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                    {contractData.code}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
