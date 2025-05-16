import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * Admin service for administrative functions
 */
class AdminService {
  /**
   * Get list of users
   * 
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with user list data
   */
  async getUsers(params = {}, token) {
    try {
      return await api.get(API_ENDPOINTS.ADMIN.USERS, params, token);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }
  
  /**
   * Get user details
   * 
   * @param {string} userId - User ID
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with user details
   */
  async getUserDetails(userId, token) {
    try {
      return await api.get(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, {}, token);
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  }
  
  /**
   * Update user
   * 
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with updated user data
   */
  async updateUser(userId, userData, token) {
    try {
      return await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, userData, token);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  
  /**
   * Delete user
   * 
   * @param {string} userId - User ID
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with deletion result
   */
  async deleteUser(userId, token) {
    try {
      return await api.del(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, token);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
  
  /**
   * Get system statistics
   * 
   * @param {string} timeframe - Timeframe for statistics
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with statistics data
   */
  async getSystemStats(timeframe = 'all', token) {
    try {
      return await api.get(API_ENDPOINTS.ADMIN.STATS, { timeframe }, token);
    } catch (error) {
      console.error('Get system stats error:', error);
      throw error;
    }
  }
  
  /**
   * Get system settings
   * 
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with settings data
   */
  async getSystemSettings(token) {
    try {
      return await api.get(API_ENDPOINTS.ADMIN.SETTINGS, {}, token);
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  }
  
  /**
   * Update system settings
   * 
   * @param {Object} settings - Updated settings
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolved with updated settings
   */
  async updateSystemSettings(settings, token) {
    try {
      return await api.put(API_ENDPOINTS.ADMIN.SETTINGS, settings, token);
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  }
}

export default new AdminService();
