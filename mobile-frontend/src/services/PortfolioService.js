import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

class PortfolioService {
  async getPortfolioSummary(token) {
    try {
      return await api.get(API_ENDPOINTS.PORTFOLIO.LIST, {}, token);
    } catch (error) {
      console.error("Get portfolio summary error:", error);
      throw error;
    }
  }

  async getPortfolioDetails(token, portfolioId = null) {
    try {
      const endpoint = portfolioId
        ? `${API_ENDPOINTS.PORTFOLIO.DETAILS}/${portfolioId}`
        : API_ENDPOINTS.PORTFOLIO.DETAILS;
      return await api.get(endpoint, {}, token);
    } catch (error) {
      console.error("Get portfolio details error:", error);
      throw error;
    }
  }

  async addAsset(assetData, token) {
    try {
      return await api.post(API_ENDPOINTS.PORTFOLIO.CREATE, assetData, token);
    } catch (error) {
      console.error("Add asset error:", error);
      throw error;
    }
  }

  async updateAsset(assetId, assetData, token) {
    try {
      return await api.put(
        `${API_ENDPOINTS.PORTFOLIO.UPDATE}/${assetId}`,
        assetData,
        token,
      );
    } catch (error) {
      console.error("Update asset error:", error);
      throw error;
    }
  }

  async removeAsset(assetId, token) {
    try {
      return await api.del(
        `${API_ENDPOINTS.PORTFOLIO.DELETE}/${assetId}`,
        token,
      );
    } catch (error) {
      console.error("Remove asset error:", error);
      throw error;
    }
  }

  async getPerformanceHistory(token, timeframe = "1m") {
    try {
      return await api.get(
        `${API_ENDPOINTS.PORTFOLIO.PERFORMANCE}`,
        { timeframe },
        token,
      );
    } catch (error) {
      console.error("Get performance history error:", error);
      throw error;
    }
  }

  async getRiskAssessment(token) {
    try {
      return await api.get(
        `${API_ENDPOINTS.PORTFOLIO.DETAILS}/risk`,
        {},
        token,
      );
    } catch (error) {
      console.error("Get risk assessment error:", error);
      throw error;
    }
  }
}

export default new PortfolioService();
