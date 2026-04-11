import { act, renderHook } from "@testing-library/react-native";
import useAsyncStorage from "../../src/hooks/useAsyncStorage";

const mockStorage = {};

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe("useAsyncStorage", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    jest.clearAllMocks();
  });

  test("initializes with given initial value", async () => {
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() =>
        useAsyncStorage("test-key", "initial"),
      );
      hookResult = result;
    });
    expect(hookResult.current[0]).toBe("initial");
  });

  test("loading starts true and becomes false", async () => {
    const { result } = renderHook(() => useAsyncStorage("test-key", null));
    expect(result.current[2].isLoading).toBe(true);
    await act(async () => {});
    expect(result.current[2].isLoading).toBe(false);
  });

  test("setValue stores and updates value", async () => {
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useAsyncStorage("test-key", ""));
      hookResult = result;
    });
    await act(async () => {
      await hookResult.current[1]("new-value");
    });
    expect(hookResult.current[0]).toBe("new-value");
  });

  test("setValue accepts function updater", async () => {
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useAsyncStorage("counter", 0));
      hookResult = result;
    });
    await act(async () => {
      await hookResult.current[1]((prev) => prev + 1);
    });
    expect(hookResult.current[0]).toBe(1);
  });

  test("removeValue resets to initial value", async () => {
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() =>
        useAsyncStorage("removable", "start"),
      );
      hookResult = result;
    });
    await act(async () => {
      await hookResult.current[1]("changed");
    });
    await act(async () => {
      await hookResult.current[2].removeValue();
    });
    expect(hookResult.current[0]).toBe("start");
  });

  test("loads persisted value from storage", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify("persisted"));
    let hookResult;
    await act(async () => {
      const { result } = renderHook(() =>
        useAsyncStorage("existing-key", "default"),
      );
      hookResult = result;
    });
    expect(hookResult.current[0]).toBe("persisted");
  });
});
