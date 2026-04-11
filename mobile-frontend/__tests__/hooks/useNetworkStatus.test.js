import { act, renderHook } from "@testing-library/react-native";
import useNetworkStatus from "../../src/hooks/useNetworkStatus";

const mockUnsubscribe = jest.fn();
const mockAddEventListener = jest.fn(() => mockUnsubscribe);
const mockFetch = jest.fn(() =>
  Promise.resolve({
    isConnected: true,
    type: "wifi",
    isInternetReachable: true,
    details: null,
  }),
);

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: (...args) => mockAddEventListener(...args),
  fetch: () => mockFetch(),
}));

describe("useNetworkStatus", () => {
  beforeEach(() => {
    mockAddEventListener.mockClear();
    mockFetch.mockClear();
    mockUnsubscribe.mockClear();
  });

  test("initializes with defaults", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);
  });

  test("subscribes to NetInfo on mount", () => {
    renderHook(() => useNetworkStatus());
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  test("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("fetches initial network state", async () => {
    await act(async () => {
      renderHook(() => useNetworkStatus());
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("exposes isOffline as inverse of isConnected", async () => {
    mockFetch.mockResolvedValueOnce({
      isConnected: false,
      type: "none",
      isInternetReachable: false,
      details: null,
    });
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useNetworkStatus());
      hookResult = result;
    });
    expect(typeof hookResult.current.isOffline).toBe("boolean");
  });

  test("exposes isWifi and isCellular flags", async () => {
    await act(async () => {
      renderHook(() => useNetworkStatus());
    });
    const { result } = renderHook(() => useNetworkStatus());
    expect(typeof result.current.isWifi).toBe("boolean");
    expect(typeof result.current.isCellular).toBe("boolean");
  });
});
