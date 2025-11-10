/**
 * Currency Formatter Utility for Indian Rupees (INR)
 * Implements Indian numbering system and currency formatting standards
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_NAME = 'Indian Rupee';

/**
 * Format number in Indian numbering system (Lakhs/Crores)
 * Example: 1000000 → 10,00,000
 */
export function formatIndianNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) return '0';

  // Split into integer and decimal parts
  const parts = number.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering system: Last 3 digits, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  // Return with decimal if non-zero
  if (parseFloat(decimalPart) > 0) {
    return formatted + '.' + decimalPart;
  }

  return formatted;
}

/**
 * Format currency amount with rupee symbol
 * Example: 25000 → ₹25,000
 */
export function formatCurrency(amount: number | string): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(number)) return `${CURRENCY_SYMBOL}0`;

  return `${CURRENCY_SYMBOL}${formatIndianNumber(number)}`;
}

/**
 * Format currency for display with optional decimal places
 * Example: 1500.50 → ₹1,500.50
 */
export function formatCurrencyDisplay(
  amount: number | string,
  showDecimals: boolean = true
): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(number)) return `${CURRENCY_SYMBOL}0`;

  if (!showDecimals && number % 1 === 0) {
    return `${CURRENCY_SYMBOL}${formatIndianNumber(Math.floor(number))}`;
  }

  return formatCurrency(number);
}

/**
 * Format currency per hour rate
 * Example: 500 → ₹500/hour
 */
export function formatHourlyRate(rate: number | string): string {
  return `${formatCurrency(rate)}/hour`;
}

/**
 * Format currency with unit (lakhs, crores, thousands)
 * Example: 1500000 → ₹15 Lakhs
 */
export function formatCurrencyWithUnit(amount: number | string): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(number)) return `${CURRENCY_SYMBOL}0`;

  if (number >= 10000000) {
    // Crores (10 million)
    return `${CURRENCY_SYMBOL}${(number / 10000000).toFixed(2)} Cr`;
  } else if (number >= 100000) {
    // Lakhs (100 thousand)
    return `${CURRENCY_SYMBOL}${(number / 100000).toFixed(2)} L`;
  } else if (number >= 1000) {
    // Thousands
    return `${CURRENCY_SYMBOL}${(number / 1000).toFixed(2)} K`;
  }

  return formatCurrency(number);
}

/**
 * Parse formatted Indian currency string to number
 * Example: "₹1,00,000" → 100000
 */
export function parseCurrency(currencyString: string): number {
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate currency input
 */
export function isValidCurrencyAmount(amount: string | number): boolean {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(number) && number >= 0;
}

/**
 * Format compact currency (for charts/small displays)
 * Example: 1234567 → ₹12.3L
 */
export function formatCompactCurrency(amount: number | string): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(number)) return `${CURRENCY_SYMBOL}0`;

  if (number >= 10000000) {
    return `${CURRENCY_SYMBOL}${(number / 10000000).toFixed(1)}Cr`;
  } else if (number >= 100000) {
    return `${CURRENCY_SYMBOL}${(number / 100000).toFixed(1)}L`;
  } else if (number >= 1000) {
    return `${CURRENCY_SYMBOL}${(number / 1000).toFixed(1)}K`;
  }

  return `${CURRENCY_SYMBOL}${number.toFixed(0)}`;
}

export default {
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
  CURRENCY_NAME,
  formatIndianNumber,
  formatCurrency,
  formatCurrencyDisplay,
  formatHourlyRate,
  formatCurrencyWithUnit,
  formatCompactCurrency,
  parseCurrency,
  isValidCurrencyAmount,
};
