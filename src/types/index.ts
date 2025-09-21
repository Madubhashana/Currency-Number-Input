export type CurrencyFormatterReturnType = {
  formattedValue: string;
  value: number;
};

export type LocaleType = {
  code: string;
  name: string;
  currency: string;
};

export type CurrencyDetailsType = {
  currency: string;
  currencySymbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  locale: string;
};
