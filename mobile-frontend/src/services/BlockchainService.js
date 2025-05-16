import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * Blockchain service for interacting with blockchain networks
 */
class BlockchainService {
  /**
   * Get transaction history for an address
   * 
   * @param {string} address - Blockchain address
   * @param {number} networkId - Blockchain network ID
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with transaction history
   */
  async getTransactionHistory(address, networkId, params = {}, token = null) {
    try {
      return await api.get(API_ENDPOINTS.BLOCKCHAIN.TRANSACTIONS, {
        address,
        networkId,
        ...params
      }, token);
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw error;
    }
  }
  
  /**
   * Get balance for an address
   * 
   * @param {string} address - Blockchain address
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with balance data
   */
  async getAddressBalance(address, networkId, token = null) {
    try {
      return await api.get(API_ENDPOINTS.BLOCKCHAIN.BALANCE, {
        address,
        networkId
      }, token);
    } catch (error) {
      console.error('Get address balance error:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction details
   * 
   * @param {string} txHash - Transaction hash
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with transaction details
   */
  async getTransactionDetails(txHash, networkId, token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.BLOCKCHAIN.TRANSACTIONS}/${txHash}`, {
        networkId
      }, token);
    } catch (error) {
      console.error('Get transaction details error:', error);
      throw error;
    }
  }
  
  /**
   * Get token balances for an address
   * 
   * @param {string} address - Blockchain address
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with token balances
   */
  async getTokenBalances(address, networkId, token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.BLOCKCHAIN.BALANCE}/tokens`, {
        address,
        networkId
      }, token);
    } catch (error) {
      console.error('Get token balances error:', error);
      throw error;
    }
  }
  
  /**
   * Get NFT balances for an address
   * 
   * @param {string} address - Blockchain address
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with NFT balances
   */
  async getNFTBalances(address, networkId, token = null) {
    try {
      return await api.get(`${API_ENDPOINTS.BLOCKCHAIN.BALANCE}/nfts`, {
        address,
        networkId
      }, token);
    } catch (error) {
      console.error('Get NFT balances error:', error);
      throw error;
    }
  }
  
  /**
   * Explore blockchain data (blocks, transactions, etc.)
   * 
   * @param {Object} params - Query parameters
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with explorer data
   */
  async exploreBlockchain(params = {}, networkId, token = null) {
    try {
      return await api.get(API_ENDPOINTS.BLOCKCHAIN.EXPLORER, {
        networkId,
        ...params
      }, token);
    } catch (error) {
      console.error('Explore blockchain error:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
