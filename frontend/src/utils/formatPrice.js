const currencyConfig = {
  vi: {
    locale: "vi-VN",
    currency: "VND",
    rate: 25000,
  },
  en: {
    locale: "en-US",
    currency: "USD",
    rate: 1,
  },
  ja: {
    locale: "ja-JP",
    currency: "JPY",
    rate: 150,
  },
};

export const formatPrice = (price, lang = "en") => {
  const config = currencyConfig[lang] || currencyConfig.en;

  const converted = price * config.rate;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(converted);
};
