import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { WalletProvider, useWallet } from "../../components/WalletProvider";

// Mock external wallet dependencies
jest.mock("@coinbase/wallet-sdk", () => jest.fn());
jest.mock("@walletconnect/web3-provider", () => jest.fn());
jest.mock("ethers", () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        listAccounts: jest.fn().mockResolvedValue(["0xabc123"]),
        getNetwork: jest
          .fn()
          .mockResolvedValue({ name: "mainnet", chainId: 1 }),
        getBalance: jest
          .fn()
          .mockResolvedValue({ toString: () => "1000000000000000000" }),
      })),
    },
    utils: {
      formatEther: jest.fn((v) => "1.0"),
      hexValue: jest.fn((v) => `0x${v.toString(16)}`),
      isAddress: jest.fn((v) => v.startsWith("0x") && v.length === 42),
      Interface: jest.fn(),
    },
    Contract: jest.fn(),
  },
}));

jest.mock("web3modal", () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({}),
    clearCachedProvider: jest.fn(),
    cachedProvider: null,
  }));
});

const TestConsumer = () => {
  const { connected, account, connectWallet, balance, error } = useWallet();
  return (
    <div>
      <span data-testid="connected">
        {connected ? "connected" : "disconnected"}
      </span>
      <span data-testid="account">{account || "no-account"}</span>
      <span data-testid="balance">{balance || "no-balance"}</span>
      {error && <span data-testid="error">{error.message}</span>}
      <button onClick={connectWallet} data-testid="connect-btn">
        Connect
      </button>
    </div>
  );
};

describe("WalletProvider", () => {
  test("renders children without crashing", () => {
    render(
      <WalletProvider>
        <div data-testid="child">Child Content</div>
      </WalletProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("provides initial disconnected state", () => {
    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>,
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("disconnected");
    expect(screen.getByTestId("account")).toHaveTextContent("no-account");
  });

  test("throws when useWallet is used outside provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useWallet must be used within a WalletProvider",
    );
    consoleError.mockRestore();
  });

  test("exposes all required context values", () => {
    const ContextChecker = () => {
      const ctx = useWallet();
      const keys = [
        "connectWallet",
        "disconnectWallet",
        "switchNetwork",
        "getContract",
        "callContractMethod",
        "sendTransaction",
        "updateBalance",
        "provider",
        "library",
        "account",
        "network",
        "chainId",
        "connected",
        "error",
        "balance",
      ];
      return (
        <div>
          {keys.map((k) => (
            <span key={k} data-testid={k}>
              {typeof ctx[k] !== "undefined" ? "present" : "missing"}
            </span>
          ))}
        </div>
      );
    };

    render(
      <WalletProvider>
        <ContextChecker />
      </WalletProvider>,
    );

    [
      "connectWallet",
      "disconnectWallet",
      "switchNetwork",
      "connected",
      "account",
    ].forEach((key) => {
      expect(screen.getByTestId(key)).toHaveTextContent("present");
    });
  });
});
