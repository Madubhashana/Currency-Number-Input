export const testUtilFunction = (num1: number, num2: number) => {
  return num1 + num2;
};

export const sanitizeCurrencyValue = (value: string) => {
  // Keep only digits, dot, and comma

  return value.replace(/[^0-9.,]/g, "");
};

export const currencyFormatter = (value: string) => {
  if (!value.length) {
    return "";
  }

  value = sanitizeCurrencyValue(value);

  // Replace custom thousand separators
  value = value.replaceAll(".", "");

  const isEndingWithComma = value.endsWith(",");

  if (isEndingWithComma) {
    value = value.slice(0, value.length - 1);
  }

  const hasDecimalValues = !isEndingWithComma && value.includes(",");

  let fractionDigits = 1;

  if (hasDecimalValues) {
    fractionDigits = value.split(",")[1].length > 1 ? 2 : 1;

    // The Intl formatter needs decimal with . separator
    value = value.replace(",", ".");
  }

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
    .filter((_part) => _part.type !== "literal" || _part.value.trim().length)
    .map((_part) => _part.value);

  if (isEndingWithComma) {
    formattedParts.push(",");
  }

  return formattedParts.join("");
};
