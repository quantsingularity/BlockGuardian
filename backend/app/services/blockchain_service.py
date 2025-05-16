import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * Blockchain service for backend interactions
 */
class BlockchainService {
  /**
   * Get blockchain data for a specific network
   * 
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with blockchain data
   */
  async getBlockchainData(token) {
    try {
      return await api.get(`${API_ENDPOINTS.BLOCKCHAIN.EXPLORER}/data`, {}, token);
    } catch (error) {
      console.error('Get blockchain data error:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction history for a portfolio
   * 
   * @param {string} portfolioId - Portfolio ID
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with transaction history
   */
  async getPortfolioTransactions(portfolioId, token) {
    try {
      return await api.get(`${API_ENDPOINTS.PORTFOLIO.DETAILS}/${portfolioId}/transactions`, {}, token);
    } catch (error) {
      console.error('Get portfolio transactions error:', error);
      throw error;
    }
  }
  
  /**
   * Analyze smart contract security
   * 
   * @param {string} contractAddress - Contract address
   * @param {number} networkId - Network ID
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with security analysis
   */
  async analyzeContractSecurity(contractAddress, networkId, token) {
    try {
      return await api.post(`${API_ENDPOINTS.SECURITY.SCAN}/contract`, {
        contractAddress,
        networkId
      }, token);
    } catch (error) {
      console.error('Analyze contract security error:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
