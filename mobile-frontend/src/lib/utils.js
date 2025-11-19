/**
 * Utility functions for formatting and validation
 */

/**
 * Formats a blockchain address for display
 *
 * @param {string} address - Full blockchain address
 * @param {number} prefixLength - Number of characters to show at start
 * @param {number} suffixLength - Number of characters to show at end
 * @returns {string} - Formatted address
 */
export const formatAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
};

/**
 * Formats a cryptocurrency amount with appropriate decimal places
 *
 * @param {number|string} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @param {boolean} trimZeros - Whether to trim trailing zeros
 * @returns {string} - Formatted amount
 */
export const formatCryptoAmount = (amount, decimals = 4, trimZeros = true) => {
  if (amount === undefined || amount === null) return '0';

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Format with fixed decimals
  let formatted = numAmount.toFixed(decimals);

  // Trim trailing zeros if requested
  if (trimZeros) {
    formatted = formatted.replace(/\.?0+$/, '');
  }

  return formatted;
};

/**
 * Formats a date for display
 *
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type ('full', 'date', 'time', 'relative')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  switch (format) {
    case 'full':
      return dateObj.toLocaleString();
    case 'date':
      return dateObj.toLocaleDateString();
    case 'time':
      return dateObj.toLocaleTimeString();
    case 'relative':
      return getRelativeTimeString(dateObj);
    default:
      return dateObj.toLocaleString();
  }
};

/**
 * Gets a relative time string (e.g., "2 hours ago")
 *
 * @param {Date} date - Date to compare
 * @returns {string} - Relative time string
 */
const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, 'date');
  }
};

/**
 * Validates an email address
 *
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password strength
 *
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true
  } = options;

  const result = {
    isValid: true,
    errors: []
  };

  if (!password || password.length < minLength) {
    result.isValid = false;
    result.errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one special character');
  }

  return result;
};

export default {
  formatAddress,
  formatCryptoAmount,
  formatDate,
  isValidEmail,
  validatePassword
};
