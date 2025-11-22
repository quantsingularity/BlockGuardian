import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

/**
 * AI service for recommendations and analysis
 */
class AIService {
    /**
     * Get AI-powered investment recommendations
     *
     * @param {Object} params - Query parameters (risk level, investment horizon, etc.)
     * @param {string} token - Authentication token
     * @returns {Promise} - Resolved with recommendation data
     */
    async getInvestmentRecommendations(params = {}, token) {
        try {
            return await api.get(API_ENDPOINTS.AI.RECOMMENDATIONS, params, token);
        } catch (error) {
            console.error('Get investment recommendations error:', error);
            throw error;
        }
    }

    /**
     * Get risk analysis for a portfolio or asset
     *
     * @param {string} portfolioId - Portfolio ID (optional)
     * @param {string} assetId - Asset ID (optional)
     * @param {string} token - Authentication token
     * @returns {Promise} - Resolved with risk analysis data
     */
    async getRiskAnalysis(portfolioId = null, assetId = null, token) {
        try {
            const params = {};
            if (portfolioId) params.portfolioId = portfolioId;
            if (assetId) params.assetId = assetId;

            return await api.get(API_ENDPOINTS.AI.RISK_ANALYSIS, params, token);
        } catch (error) {
            console.error('Get risk analysis error:', error);
            throw error;
        }
    }

    /**
     * Get sentiment analysis for a cryptocurrency or the market
     *
     * @param {string} coinId - Cryptocurrency ID (optional)
     * @param {string} token - Authentication token (optional)
     * @returns {Promise} - Resolved with sentiment analysis data
     */
    async getSentimentAnalysis(coinId = null, token = null) {
        try {
            const params = coinId ? { coinId } : {};
            return await api.get(API_ENDPOINTS.AI.SENTIMENT, params, token);
        } catch (error) {
            console.error('Get sentiment analysis error:', error);
            throw error;
        }
    }

    /**
     * Get personalized portfolio optimization suggestions
     *
     * @param {string} portfolioId - Portfolio ID
     * @param {Object} params - Optimization parameters
     * @param {string} token - Authentication token
     * @returns {Promise} - Resolved with optimization suggestions
     */
    async getPortfolioOptimization(portfolioId, params = {}, token) {
        try {
            return await api.post(
                `${API_ENDPOINTS.AI.RECOMMENDATIONS}/optimize`,
                {
                    portfolioId,
                    ...params,
                },
                token,
            );
        } catch (error) {
            console.error('Get portfolio optimization error:', error);
            throw error;
        }
    }

    /**
     * Get market trend predictions
     *
     * @param {string} timeframe - Prediction timeframe
     * @param {Array} assets - List of assets to predict (optional)
     * @param {string} token - Authentication token (optional)
     * @returns {Promise} - Resolved with trend prediction data
     */
    async getMarketPredictions(timeframe = '1w', assets = [], token = null) {
        try {
            return await api.get(
                `${API_ENDPOINTS.AI.RECOMMENDATIONS}/predict`,
                {
                    timeframe,
                    assets: assets.join(','),
                },
                token,
            );
        } catch (error) {
            console.error('Get market predictions error:', error);
            throw error;
        }
    }
}

export default new AIService();
