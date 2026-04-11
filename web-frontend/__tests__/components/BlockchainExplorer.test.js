import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BlockchainExplorer from "../../components/BlockchainExplorer";

jest.mock("../../components/WalletProvider", () => ({
  useWallet: () => ({
    library: null,
    account: null,
    network: null,
    chainId: null,
    connected: false,
  }),
}));

jest.mock("ethers", () => ({
  ethers: {
    utils: {
      formatEther: jest.fn((v) => "0.0"),
      isAddress: jest.fn((v) => v.startsWith("0x")),
      Interface: jest.fn(),
      formatUnits: jest.fn(() => "1000"),
    },
    Contract: jest.fn(),
  },
}));

describe("BlockchainExplorer (disconnected)", () => {
  test("shows connect wallet prompt when disconnected", () => {
    render(<BlockchainExplorer />);
    expect(screen.getByText(/Wallet Not Connected/i)).toBeInTheDocument();
    expect(screen.getByText(/Please connect your wallet/i)).toBeInTheDocument();
  });
});

describe("BlockchainExplorer (connected)", () => {
  const mockLibrary = {
    getBlockNumber: jest.fn().mockResolvedValue(100),
    getBlockWithTransactions: jest.fn().mockResolvedValue({
      number: 100,
      timestamp: Date.now() / 1000,
      transactions: [],
    }),
    getBlock: jest.fn().mockResolvedValue({
      number: 100,
      hash: "0xabc",
      timestamp: Date.now() / 1000,
      transactions: [],
      gasUsed: { toString: () => "21000" },
      gasLimit: { toString: () => "30000000" },
      miner: "0xminer",
    }),
    getCode: jest.fn().mockResolvedValue("0x"),
    getTransactionCount: jest.fn().mockResolvedValue(5),
    getBalance: jest.fn().mockResolvedValue({ toString: () => "0" }),
    getTransaction: jest.fn().mockResolvedValue(null),
    getTransactionReceipt: jest.fn().mockResolvedValue(null),
  };

  beforeEach(() => {
    jest.resetModules();
    jest.mock("../../components/WalletProvider", () => ({
      useWallet: () => ({
        library: mockLibrary,
        account: "0x1234567890abcdef1234567890abcdef12345678",
        network: "mainnet",
        chainId: 1,
        connected: true,
      }),
    }));
  });

  test("renders search bar", () => {
    const { getByPlaceholderText } = render(<BlockchainExplorer />);
    expect(getByPlaceholderText(/Search by address/i)).toBeInTheDocument();
  });
});
