import {
  sanitizeCurrencyValue,
  currencyFormatter,
  decimalFormatter,
} from "../utilts";

describe("sanitizeCurrencyValue", () => {
  it("should accepts digits, dot, and comma only", () => {
    expect(sanitizeCurrencyValue("abc123.45,xyz!")).toBe("123.45,");

    expect(sanitizeCurrencyValue("Price: $4,567.89 USD")).toBe("4,567.89");
  });
});

describe("currencyFormatter functionality", () => {
  it("returns empty string for empty input", () => {
    expect(currencyFormatter("")).toBe("");
  });

  it("preserves a trailing comma", () => {
    expect(currencyFormatter("1234,")).toBe("1.234,");
  });

  it("is idempotent for already-formatted values with dot thousands + comma decimal", () => {
    expect(currencyFormatter("1.234,5")).toBe("1.234,5");
    expect(currencyFormatter("1.234,56")).toBe("1.234,56");
  });
});

describe("decimalFormatter functionality", () => {
  it("rounds to 2 decimals only when the input provides >=2 decimals", () => {
    // With ',50' exactly two decimals, it keeps two
    expect(decimalFormatter("0001234,50")).toBe("1.234,50");

    // With more than two decimals, function sets fractionDigits to 2
    // Example: "1.234,567" -> dots removed to "1234,567" -> becomes 1234.567 -> formatted "1.234,57"
    expect(decimalFormatter("1.234,567")).toBe("1.234,57");
  });
});

describe("currencyFormatter expected behaviours", () => {
  it("should returns the expected outcomes when typing", () => {
    expect(currencyFormatter("1")).toBe("1");
    expect(currencyFormatter("1.")).toBe("1");
    expect(currencyFormatter("1234")).toBe("1.234");
    expect(currencyFormatter("1234,")).toBe("1.234,");
    expect(currencyFormatter("1234,5")).toBe("1.234,5");
    expect(currencyFormatter("1234,50")).toBe("1.234,50");
  });
});
