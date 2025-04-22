/**
 * Format a date string or Date object into a readable string.
 * @param date - Date object or ISO string
 * @param locale - Locale code, default 'en-US'
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a number as currency.
 * @param amount - Numeric amount
 * @param locale - Locale code, default 'en-US'
 * @param currency - Currency code, default 'USD'
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale = 'en-US',
  currency = 'USD'
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
