import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

/**
 * Security service for blockchain security checks and alerts
 */
class SecurityService {
  /**
   * Scan an address or contract for security issues
   *
   * @param {string} address - Blockchain address or contract
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with security scan results
   */
  async scanAddress(address, networkId, token = null) {
    try {
      return await api.post(
        API_ENDPOINTS.SECURITY.SCAN,
        {
          address,
          networkId,
        },
        token,
      );
    } catch (error) {
      console.error("Security scan error:", error);
      throw error;
    }
  }

  /**
   * Get security alerts for user's addresses
   *
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with security alerts
   */
  async getSecurityAlerts(token) {
    try {
      return await api.get(API_ENDPOINTS.SECURITY.ALERTS, {}, token);
    } catch (error) {
      console.error("Get security alerts error:", error);
      throw error;
    }
  }

  /**
   * Generate a security report for an address
   *
   * @param {string} address - Blockchain address
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with security report
   */
  async generateSecurityReport(address, networkId, token = null) {
    try {
      return await api.get(
        API_ENDPOINTS.SECURITY.REPORT,
        {
          address,
          networkId,
        },
        token,
      );
    } catch (error) {
      console.error("Generate security report error:", error);
      throw error;
    }
  }

  /**
   * Verify a smart contract
   *
   * @param {string} contractAddress - Smart contract address
   * @param {number} networkId - Blockchain network ID
   * @param {Object} contractData - Contract verification data
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with verification results
   */
  async verifyContract(contractAddress, networkId, contractData, token = null) {
    try {
      return await api.post(
        `${API_ENDPOINTS.SECURITY.SCAN}/verify`,
        {
          contractAddress,
          networkId,
          ...contractData,
        },
        token,
      );
    } catch (error) {
      console.error("Verify contract error:", error);
      throw error;
    }
  }

  /**
   * Check transaction for potential fraud or scams
   *
   * @param {string} txHash - Transaction hash
   * @param {number} networkId - Blockchain network ID
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - Resolved with fraud check results
   */
  async checkTransactionSafety(txHash, networkId, token = null) {
    try {
      return await api.get(
        `${API_ENDPOINTS.SECURITY.SCAN}/transaction`,
        {
          txHash,
          networkId,
        },
        token,
      );
    } catch (error) {
      console.error("Check transaction safety error:", error);
      throw error;
    }
  }
}

export default new SecurityService();
