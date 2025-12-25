import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../lib/constants';

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
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });

            // Store token if provided
            if (response.token || response.access_token) {
                const token = response.token || response.access_token;
                await this.setToken(token);
            }

            // Store user profile if provided
            if (response.user) {
                await this.setUserProfile(response.user);
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
            if (response.token || response.access_token) {
                const token = response.token || response.access_token;
                await this.setToken(token);
            }

            // Store user profile if provided
            if (response.user) {
                await this.setUserProfile(response.user);
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
            const token = await this.getToken();

            // Call logout endpoint if we have a token
            if (token) {
                try {
                    await api.post(API_ENDPOINTS.AUTH.LOGOUT, {}, token);
                } catch (apiError) {
                    console.warn('Logout API call failed:', apiError);
                    // Continue with local logout even if API fails
                }
            }

            // Clear all stored auth data
            await this.clearAuthData();

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);

            // Still clear auth data even if there are errors
            try {
                await this.clearAuthData();
            } catch (clearError) {
                console.error('Failed to clear auth data:', clearError);
            }

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
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (error) {
            console.error('Set token error:', error);
            throw error;
        }
    }

    /**
     * Clear authentication token
     *
     * @returns {Promise} - Resolved when token is removed
     */
    async clearToken() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Clear token error:', error);
            throw error;
        }
    }

    /**
     * Get user profile from storage
     *
     * @returns {Promise<Object|null>} - Resolved with user profile or null
     */
    async getUserProfile() {
        try {
            const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            return profileJson ? JSON.parse(profileJson) : null;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }

    /**
     * Set user profile in storage
     *
     * @param {Object} profile - User profile data
     * @returns {Promise} - Resolved when profile is stored
     */
    async setUserProfile(profile) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        } catch (error) {
            console.error('Set user profile error:', error);
            throw error;
        }
    }

    /**
     * Clear all authentication data
     *
     * @returns {Promise} - Resolved when all data is cleared
     */
    async clearAuthData() {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_PROFILE]);
        } catch (error) {
            console.error('Clear auth data error:', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     *
     * @returns {Promise<boolean>} - True if authenticated
     */
    async isAuthenticated() {
        try {
            const token = await this.getToken();
            return !!token;
        } catch (error) {
            console.error('Check authentication error:', error);
            return false;
        }
    }

    /**
     * Refresh authentication token
     *
     * @returns {Promise} - Resolved with new token
     */
    async refreshToken() {
        try {
            const currentToken = await this.getToken();
            if (!currentToken) {
                throw new Error('No token to refresh');
            }

            const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {}, currentToken);

            if (response.token || response.access_token) {
                const newToken = response.token || response.access_token;
                await this.setToken(newToken);
            }

            return response;
        } catch (error) {
            console.error('Refresh token error:', error);
            // Clear token if refresh fails
            await this.clearToken();
            throw error;
        }
    }

    /**
     * Get current user profile from API
     *
     * @returns {Promise} - Resolved with user profile
     */
    async fetchProfile() {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }

            const profile = await api.get(API_ENDPOINTS.AUTH.PROFILE, {}, token);
            await this.setUserProfile(profile);

            return profile;
        } catch (error) {
            console.error('Fetch profile error:', error);
            throw error;
        }
    }
}

export default new AuthService();
