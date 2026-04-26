
export type CurrencyConfig = {
  symbol: string;
  code: string;
  locale: string;
  rate: number; // Multiplier from USD base
};

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  IN: { symbol: "₹", code: "INR", locale: "en-IN", rate: 83 },
  US: { symbol: "$", code: "USD", locale: "en-US", rate: 1 },
  SA: { symbol: "ر.س", code: "SAR", locale: "ar-SA", rate: 3.75 },
  RU: { symbol: "₽", code: "RUB", locale: "ru-RU", rate: 90 },
  DEFAULT: { symbol: "$", code: "USD", locale: "en-US", rate: 1 },
};

/**
 * Intelligent helper to get the best currency for the user
 * In production, this can be combined with Cloudflare/Vercel Country Headers
 */
export function getCurrency(countryCode?: string): CurrencyConfig {
  if (!countryCode) {
    // Client side fallback: try to guess from browser locale
    const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
    if (locale.includes("IN")) return CURRENCY_MAP.IN;
    if (locale.includes("RU")) return CURRENCY_MAP.RU;
    if (locale.includes("SA")) return CURRENCY_MAP.SA;
    return CURRENCY_MAP.DEFAULT;
  }
  return CURRENCY_MAP[countryCode] || CURRENCY_MAP.DEFAULT;
}

export function formatPrice(amount: number, config: CurrencyConfig): string {
  return config.symbol + (amount * config.rate).toLocaleString(config.locale, {
    maximumFractionDigits: 0,
  });
}
