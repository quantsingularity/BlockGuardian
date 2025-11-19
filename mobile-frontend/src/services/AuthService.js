import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * Authentication service for user login, registration, and token management
 */
class AuthService {
  /**
   * Login with email and password
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Resolved with user data and token
   */
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });

      // Store token if provided
      if (response.token) {
        await this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   *
   * @param {Object} userData - User registration data
   * @returns {Promise} - Resolved with user data
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

      // Store token if provided
      if (response.token) {
        await this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   *
   * @returns {Promise} - Resolved when logout is complete
   */
  async logout() {
    try {
      // Call logout endpoint if needed
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);

      // Clear stored token
      await this.clearToken();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);

      // Still clear token even if API call fails
      await this.clearToken();

      throw error;
    }
  }

  /**
   * Get current authentication token
   *
   * @returns {Promise<string|null>} - Resolved with token or null
   */
  async getToken() {
    try {
      // Implementation would use AsyncStorage in a real app
      // For now, we'll use a mock implementation
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   *
   * @param {string} token - JWT token
   * @returns {Promise} - Resolved when token is stored
   */
  async setToken(token) {
    try {
      // Implementation would use AsyncStorage in a real app
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Set token error:', error);
      throw error;
    }
  }

  /**
   * Clear authentication token
   *
   * @returns {Promise} - Resolved when token is cleared
   */
  async clearToken() {
    try {
      // Implementation would use AsyncStorage in a real app
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Clear token error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns {Promise<boolean>} - Resolved with authentication status
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Refresh authentication token
   *
   * @returns {Promise} - Resolved with new token
   */
  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);

      if (response.token) {
        await this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
}

export default new AuthService();
