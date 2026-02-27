import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

/**
 * Portfolio service for managing user's blockchain assets and investments
 */
class PortfolioService {
  /**
   * Get user's portfolio summary
   *
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with portfolio summary data
   */
  async getPortfolioSummary(token) {
    try {
      return await api.get(API_ENDPOINTS.PORTFOLIO.LIST, {}, token);
    } catch (error) {
      console.error("Get portfolio summary error:", error);
      throw error;
    }
  }

  /**
   * Get detailed portfolio information
   *
   * @param {string} token - Authentication token
   * @param {string} portfolioId - Portfolio ID (optional)
   * @returns {Promise} - Resolved with detailed portfolio data
   */
  async getPortfolioDetails(token, portfolioId = null) {
    try {
      const params = portfolioId ? { id: portfolioId } : {};
      return await api.get(API_ENDPOINTS.PORTFOLIO.DETAILS, params, token);
    } catch (error) {
      console.error("Get portfolio details error:", error);
      throw error;
    }
  }

  /**
   * Add asset to portfolio
   *
   * @param {Object} assetData - Asset data to add
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with updated portfolio
   */
  async addAsset(assetData, token) {
    try {
      return await api.post(API_ENDPOINTS.PORTFOLIO.ADD, assetData, token);
    } catch (error) {
      console.error("Add asset error:", error);
      throw error;
    }
  }

  /**
   * Update portfolio asset
   *
   * @param {string} assetId - Asset ID to update
   * @param {Object} assetData - Updated asset data
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with updated portfolio
   */
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

  /**
   * Remove asset from portfolio
   *
   * @param {string} assetId - Asset ID to remove
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with updated portfolio
   */
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

  /**
   * Get portfolio performance history
   *
   * @param {string} token - Authentication token
   * @param {string} timeframe - Timeframe for history (e.g., '1d', '1w', '1m', '1y')
   * @returns {Promise} - Resolved with performance history data
   */
  async getPerformanceHistory(token, timeframe = "1m") {
    try {
      return await api.get(
        `${API_ENDPOINTS.PORTFOLIO.DETAILS}/history`,
        { timeframe },
        token,
      );
    } catch (error) {
      console.error("Get performance history error:", error);
      throw error;
    }
  }

  /**
   * Get portfolio risk assessment
   *
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with risk assessment data
   */
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
