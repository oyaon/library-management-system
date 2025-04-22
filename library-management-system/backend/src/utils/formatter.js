// Utility functions for date and currency formatting

/**
 * Format a date string or Date object into a readable string.
 * @param {string|Date} date - The date to format.
 * @param {string} locale - Locale code (default 'en-US').
 * @param {object} options - Intl.DateTimeFormat options.
 * @returns {string}
 */
function formatDate(date, locale = 'en-US', options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a number as currency.
 * @param {number} amount - The amount to format.
 * @param {string} locale - Locale code (default 'en-US').
 * @param {string} currency - Currency code (default 'USD').
 * @returns {string}
 */
function formatCurrency(amount, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

module.exports = { formatDate, formatCurrency };
