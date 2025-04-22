const { formatDate, formatCurrency } = require('../utils/formatter');

describe('formatter util', () => {
  describe('formatDate', () => {
    it('formats a JS Date object correctly', () => {
      const date = new Date('2025-04-23T00:00:00Z');
      const formatted = formatDate(date, 'en-US');
      // April 23, 2025
      expect(formatted).toMatch(/2025/);
    });

    it('formats an ISO string correctly', () => {
      const formatted = formatDate('2025-12-31T23:59:59Z', 'en-GB');
      expect(formatted).toContain('31');
    });
  });

  describe('formatCurrency', () => {
    it('formats number as USD by default', () => {
      const formatted = formatCurrency(1234.5);
      expect(formatted).toContain('$1,234.50');
    });

    it('formats number with specified currency and locale', () => {
      const formatted = formatCurrency(1000, 'de-DE', 'EUR');
      expect(formatted).toContain('1.000,00');
    });
  });
});
