import { LOCALE_CURRENCY_MAP } from "../config/constants";
import { CurrencyFormatterReturnType, CurrencyDetailsType } from "../types";

export const testUtilFunction = (num1: number, num2: number) => {
  return num1 + num2;
};

/**
 * This function always returns the actual monetary value.
 * Ex: 1,234.56 USD -> 1234.56
 */
export const sanitizeCurrencyValue = (
  value: string,
  decimalSeparator: string,
  thousandsSeparator: string
) => {
  /* Keep only one decimal seperator (the last occurance)
   * Note: User may enter an invalid value with more than one decimal seperators.
   */
  const lastIndex = value.lastIndexOf(decimalSeparator);
  if (lastIndex >= 0) {
    const valueWithoutDecimalSeparator = value.replaceAll(decimalSeparator, "");
    value =
      valueWithoutDecimalSeparator.slice(0, lastIndex) +
      decimalSeparator +
      valueWithoutDecimalSeparator.slice(lastIndex);
  }

  // Replace custom thousand separators
  value = value.replaceAll(thousandsSeparator, "");

  // The Intl formatter needs decimal with . separator
  value = value.replace(decimalSeparator, ".");

  return value.replace(/[^0-9.]/g, "");
};

export const currencyFormatter = (
  value: string,
  options: {
    fractionDigits?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
    locale: string;
    currency: string;
  }
): CurrencyFormatterReturnType => {
  if (!value.length) {
    return { formattedValue: "", value: 0 };
  }

  const thousandsSeparator = options?.thousandsSeparator ?? ".";
  const decimalSeparator = options?.decimalSeparator ?? ",";

  const isEndingWithDecimalSeparator = value.endsWith(decimalSeparator);

  value = sanitizeCurrencyValue(value, decimalSeparator, thousandsSeparator);

  // eslint-disable-next-line
  const [int, fraction] = value.split(".");
  const hasDecimalValues = fraction && fraction.length > 0;

  let fractionDigits = options?.fractionDigits || 1;

  if (hasDecimalValues && !options?.fractionDigits) {
    fractionDigits = fraction.length;
  }

  const currencyFormatter = new Intl.NumberFormat(options.locale, {
    style: "currency",
    currency: options.currency,
    currencyDisplay: "code",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedParts = currencyFormatter
    .formatToParts(Number(value))
    .filter(
      (_part) =>
        _part.type !== "currency" &&
        (_part.type !== "literal" || _part.value.trim().length)
    )
    .filter((_part) => {
      // Keep the decimal part, if the value ends with the decimal separator.
      if (isEndingWithDecimalSeparator) {
        return _part.type !== "fraction";
      }

      // Keep both decimal and fraction parts, if the value has valid decimals.
      if (hasDecimalValues) {
        return true;
      }

      // else, filter out both both decimal and fraction parts.
      return !["decimal", "fraction"].includes(_part.type);
    });

  return {
    formattedValue: formattedParts.map((_part) => _part.value).join(""),
    value: Number(value),
  };
};

export const getCurrencyDetailsByLocale = (
  locale: string
): CurrencyDetailsType | null => {
  const localeData = LOCALE_CURRENCY_MAP.find(
    (_locale) => _locale.code === locale
  );

  if (!localeData) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    useGrouping: true,
    currency: localeData.currency,
  });

  let currencySymbol = "";
  let thousandsSeparator = "";
  let decimalSeparator = "";

  // get each symbol explicitly
  currencyFormatter.formatToParts(1234567.89).forEach((_part) => {
    if (_part.type === "currency") {
      currencySymbol = _part.value;
    } else if (_part.type === "group") {
      thousandsSeparator = _part.value;
    } else if (_part.type === "decimal") {
      decimalSeparator = _part.value;
    }
  });

  return {
    currency: localeData.currency,
    currencySymbol,
    thousandsSeparator,
    decimalSeparator,
    locale,
  };
};
