import { LOCALE_CURRENCY_MAP } from "../config/constants";
import { CurrencyFormatterReturnType, CurrencyDetailsType } from "../types";

export const testUtilFunction = (num1: number, num2: number) => {
  return num1 + num2;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const sanitizeCurrencyValue = (
  value: string,
  decimalSeparator: string,
  thousandSeparator: string
) => {
  /* Keep only one decimal seperator (the last occurance)
   * Note: User may enter an invalid value with more than one decimal seperators.
   */
  const lastIndex = value.lastIndexOf(decimalSeparator);
  if (lastIndex >= 0) {
    const valueWithoutCommas = value.replaceAll(decimalSeparator, "");
    value =
      valueWithoutCommas.slice(0, lastIndex) +
      decimalSeparator +
      valueWithoutCommas.slice(lastIndex);
  }

  // Keep only the digits and separators
  const regex = new RegExp(
    `[^0-9${escapeRegex(decimalSeparator)}${escapeRegex(thousandSeparator)}]`,
    "g"
  );
  return value.replace(regex, "");
};

const getFormattedCurrency = ({
  value,
  locale,
  currency,
  fractionDigits,
  hasDecimalValues,
  decimalSeparator,
  isEndingWithDecimalSeparator,
}: {
  value: string;
  fractionDigits: number;
  hasDecimalValues: boolean;
  isEndingWithDecimalSeparator: boolean;
  locale: string;
  currency: string;
  decimalSeparator: string;
}): CurrencyFormatterReturnType => {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedParts = currencyFormatter
    .formatToParts(Number(value))
    .filter((_part) => _part.type !== "currency")
    .filter((_part) => {
      if (hasDecimalValues) {
        return true;
      }

      return !["decimal", "fraction"].includes(_part.type);
    })
    .filter((_part) => _part.type !== "literal" || _part.value.trim().length);

  if (isEndingWithDecimalSeparator) {
    formattedParts.push({ value: decimalSeparator, type: "decimal" });
  }

  const valueParts = formattedParts.filter((_part) => _part.type !== "group");

  console.log("decimalSeparator ", decimalSeparator);
  console.log("valueParts ", value);

  return {
    formattedValue: formattedParts.map((_part) => _part.value).join(""),
    value: Number(value),
  };
};

export const currencyFormatter = (
  value: string,
  options: {
    fractionDigits?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
    locale: string;
    currency: string;
  }
): CurrencyFormatterReturnType => {
  if (!value.length) {
    return { formattedValue: "", value: 0 };
  }

  const thousandSeparator = options?.thousandSeparator ?? ".";
  const decimalSeparator = options?.decimalSeparator ?? ",";

  value = sanitizeCurrencyValue(value, decimalSeparator, thousandSeparator);

  // Replace custom thousand separators
  value = value.replaceAll(thousandSeparator, "");

  const isEndingWithDecimalSeparator = value.endsWith(decimalSeparator);

  if (isEndingWithDecimalSeparator) {
    value = value.slice(0, value.length - 1);
  }

  const hasDecimalValues =
    !isEndingWithDecimalSeparator && value.includes(decimalSeparator);

  let fractionDigits = options?.fractionDigits || 1;

  if (hasDecimalValues) {
    if (!options?.fractionDigits) {
      fractionDigits = value.split(decimalSeparator)[1].length;
    }

    // The Intl formatter needs decimal with . separator
    value = value.replace(decimalSeparator, ".");
  }

  return getFormattedCurrency({
    value,
    locale: options.locale,
    currency: options.currency,
    decimalSeparator,
    fractionDigits,
    hasDecimalValues,
    isEndingWithDecimalSeparator,
  });
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
  let thousandSeparator = "";
  let decimalSeparator = "";

  // get each symbol explicitly
  currencyFormatter.formatToParts(1234567.89).forEach((_part) => {
    if (_part.type === "currency") {
      currencySymbol = _part.value;
    } else if (_part.type === "group") {
      thousandSeparator = _part.value;
    } else if (_part.type === "decimal") {
      decimalSeparator = _part.value;
    }
  });

  return {
    currency: localeData.currency,
    currencySymbol,
    thousandSeparator,
    decimalSeparator,
    locale,
  };
};
