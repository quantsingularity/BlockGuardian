jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return mockAxios;
});

import axios from "axios";
import {
  authAPI,
  blockchainAPI,
  healthAPI,
  portfolioAPI,
  analyticsAPI,
  adminAPI,
} from "../../services/api";

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  describe("authAPI", () => {
    test("login should return response data", async () => {
      const mockResponse = {
        data: { tokens: { access_token: "test_token" }, user: { id: 1 } },
      };
      axios.post.mockResolvedValue(mockResponse);
      const result = await authAPI.login("test@example.com", "password");
      expect(result).toEqual(mockResponse.data);
    });

    test("register should return response data", async () => {
      const mockResponse = {
        data: { message: "User registered successfully" },
      };
      axios.post.mockResolvedValue(mockResponse);
      const result = await authAPI.register({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("logout should clear local storage", async () => {
      axios.post.mockResolvedValue({ data: {} });
      await authAPI.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith("access_token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("refresh_token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    test("getCurrentUser should return current user data", async () => {
      const mockResponse = { data: { id: 1, email: "test@example.com" } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await authAPI.getCurrentUser();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("portfolioAPI", () => {
    test("getAll should fetch all portfolios", async () => {
      const mockResponse = { data: { portfolios: [] } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await portfolioAPI.getAll();
      expect(result).toEqual(mockResponse.data);
    });

    test("getById should fetch a single portfolio", async () => {
      const mockResponse = { data: { id: 1, name: "My Portfolio" } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await portfolioAPI.getById(1);
      expect(result).toEqual(mockResponse.data);
    });

    test("create should create a portfolio", async () => {
      const mockResponse = { data: { id: 1, name: "Test Portfolio" } };
      axios.post.mockResolvedValue(mockResponse);
      const result = await portfolioAPI.create({ name: "Test Portfolio" });
      expect(result).toEqual(mockResponse.data);
    });

    test("update should update a portfolio", async () => {
      const mockResponse = { data: { id: 1, name: "Updated Portfolio" } };
      axios.put.mockResolvedValue(mockResponse);
      const result = await portfolioAPI.update(1, {
        name: "Updated Portfolio",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("delete should delete a portfolio", async () => {
      const mockResponse = { data: { success: true } };
      axios.delete.mockResolvedValue(mockResponse);
      const result = await portfolioAPI.delete(1);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("blockchainAPI", () => {
    test("explore should query blockchain data", async () => {
      const mockResponse = { data: { results: [] } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await blockchainAPI.explore("0xabc");
      expect(result).toEqual(mockResponse.data);
    });

    test("getTransaction should fetch transaction data", async () => {
      const mockResponse = { data: { hash: "0xabc", value: "1.0" } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await blockchainAPI.getTransaction("0xabc");
      expect(result).toEqual(mockResponse.data);
    });

    test("getAddress should fetch address data", async () => {
      const mockResponse = { data: { address: "0x123", balance: "5.0" } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await blockchainAPI.getAddress("0x123");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("analyticsAPI", () => {
    test("getMarketData should return market data", async () => {
      const mockResponse = { data: { markets: [] } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await analyticsAPI.getMarketData();
      expect(result).toEqual(mockResponse.data);
    });

    test("getAIRecommendations should return recommendations", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await analyticsAPI.getAIRecommendations();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("adminAPI", () => {
    test("getUsers should return users", async () => {
      const mockResponse = { data: { users: [] } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await adminAPI.getUsers();
      expect(result).toEqual(mockResponse.data);
    });

    test("getStats should return platform stats", async () => {
      const mockResponse = { data: { totalUsers: 450, activeToday: 120 } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await adminAPI.getStats();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("healthAPI", () => {
    test("check should return health status", async () => {
      const mockResponse = { data: { status: "healthy" } };
      axios.get.mockResolvedValue(mockResponse);
      const result = await healthAPI.check();
      expect(result).toEqual(mockResponse.data);
    });

    test("getInfo should return API info", async () => {
      const mockResponse = {
        data: { name: "BlockGuardian API", version: "1.0.0" },
      };
      axios.get.mockResolvedValue(mockResponse);
      const result = await healthAPI.getInfo();
      expect(result).toEqual(mockResponse.data);
    });
  });
});
