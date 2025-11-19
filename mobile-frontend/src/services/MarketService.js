import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * Market service for cryptocurrency market data and analysis
 */
class MarketService {
  /**
   * Get current market prices for cryptocurrencies
   *
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with market price data
   */
  async getMarketPrices(params = {}, token = null) {
    try {
      return await api.get(API_ENDPOINTS.MARKET.PRICES, params, token);
    } catch (error) {
      console.error('Get market prices error:', error);
      throw error;
    }
  }

  /**
   * Get market trends and analysis
   *
   * @param {string} timeframe - Timeframe for trends (e.g., '1d', '1w', '1m', '1y')
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with market trend data
   */
  async getMarketTrends(timeframe = '1d', token = null) {
    try {
      return await api.get(API_ENDPOINTS.MARKET.TRENDS, { timeframe }, token);
    } catch (error) {
      console.error('Get market trends error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific cryptocurrency
   *
   * @param {string} coinId - Cryptocurrency ID or symbol
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with detailed coin data
   */
  async getCoinDetails(coinId, token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.MARKET.DETAILS}/${coinId}`, {}, token);
    } catch (error) {
      console.error('Get coin details error:', error);
      throw error;
    }
  }

  /**
   * Get price history for a specific cryptocurrency
   *
   * @param {string} coinId - Cryptocurrency ID or symbol
   * @param {string} timeframe - Timeframe for history (e.g., '1d', '1w', '1m', '1y')
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with price history data
   */
  async getPriceHistory(coinId, timeframe = '1m', token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.MARKET.DETAILS}/${coinId}/history`, { timeframe }, token);
    } catch (error) {
      console.error('Get price history error:', error);
      throw error;
    }
  }

  /**
   * Search for cryptocurrencies by name or symbol
   *
   * @param {string} query - Search query
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with search results
   */
  async searchCoins(query, token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.MARKET.PRICES}/search`, { query }, token);
    } catch (error) {
      console.error('Search coins error:', error);
      throw error;
    }
  }

  /**
   * Get market sentiment analysis
   *
   * @param {string} coinId - Cryptocurrency ID or symbol (optional)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with sentiment data
   */
  async getSentimentAnalysis(coinId = null, token = null) {
    try {
      const params = coinId ? { coinId } : {};
      return await api.get(`${API_ENDPOINTS.AI.SENTIMENT}`, params, token);
    } catch (error) {
      console.error('Get sentiment analysis error:', error);
      throw error;
    }
  }
}

export default new MarketService();
