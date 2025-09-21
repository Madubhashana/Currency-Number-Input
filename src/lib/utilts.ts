import { DEFAULT_CURRENCY_DECIMALS } from "../config/constants";
import { CurrencyFormatterReturnType } from "../types";

export const testUtilFunction = (num1: number, num2: number) => {
  return num1 + num2;
};

export const sanitizeCurrencyValue = (value: string) => {
  // Keep only digits, dot, and comma
  value = value.replace(/[^0-9.,]/g, "");

  /* Keep only one decimal seperator (the last occurance)
   * Note: User may enter an invalid value with more than one decimal seperators.
   */
  const lastIndex = value.lastIndexOf(",");
  if (lastIndex >= 0) {
    const valueWithoutCommas = value.replace(/,/g, "");
    value =
      valueWithoutCommas.slice(0, lastIndex) +
      "," +
      valueWithoutCommas.slice(lastIndex);
  }

  return value.replace(/[^0-9.,]/g, "");
};

const getFormattedCurrency = ({
  value,
  fractionDigits,
  hasDecimalValues,
  isEndingWithComma,
}: {
  value: string;
  fractionDigits: number;
  hasDecimalValues: boolean;
  isEndingWithComma: boolean;
}): CurrencyFormatterReturnType => {
  const currencyFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
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

  if (isEndingWithComma) {
    formattedParts.push({ value: ",", type: "decimal" });
  }

  const valueParts = formattedParts.filter((_part) => _part.type !== "group");

  return {
    formattedValue: formattedParts.map((_part) => _part.value).join(""),
    value: Number(
      valueParts
        .map((_part) => _part.value)
        .join("")
        .replace(",", ".")
    ),
  };
};

export const currencyFormatter = (
  value: string,
  options?: { fractionDigits?: number }
): CurrencyFormatterReturnType => {
  if (!value.length) {
    return { formattedValue: "", value: 0 };
  }

  value = sanitizeCurrencyValue(value);

  // Replace custom thousand separators
  value = value.replaceAll(".", "");

  const isEndingWithComma = value.endsWith(",");

  if (isEndingWithComma) {
    value = value.slice(0, value.length - 1);
  }

  const hasDecimalValues = !isEndingWithComma && value.includes(",");

  let fractionDigits = options?.fractionDigits || 1;

  if (hasDecimalValues) {
    if (!options?.fractionDigits) {
      fractionDigits = value.split(",")[1].length;
    }

    // The Intl formatter needs decimal with . separator
    value = value.replace(",", ".");
  }

  return getFormattedCurrency({
    value,
    fractionDigits,
    hasDecimalValues,
    isEndingWithComma,
  });
};

export const decimalFormatter = (
  value: string,
  fractionDigits: number = DEFAULT_CURRENCY_DECIMALS
) => {
  // Replace custom thousand separators
  // Replace decimal seperators with . (for Intl)
  value = value.replaceAll(".", "").replace(",", ".");

  return getFormattedCurrency({
    value,
    fractionDigits,
    hasDecimalValues: true,
    isEndingWithComma: false,
  }).formattedValue;
};
