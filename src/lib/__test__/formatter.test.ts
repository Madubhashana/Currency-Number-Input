import { CurrencyDetailsType } from "../../types";
import { sanitizeCurrencyValue, currencyFormatter } from "../utilts";

describe("sanitizeCurrencyValue", () => {
  it("should accepts digits, dot, and comma only", () => {
    expect(
      sanitizeCurrencyValue("Price: 1,234.56 USD", ".", ",")
    ).toStrictEqual("1,234.56");

    expect(sanitizeCurrencyValue("CHF 1'234.56", ".", "'")).toStrictEqual(
      "1'234.56"
    );
  });
});

const {
  decimalSeparator,
  thousandsSeparator,
  locale,
  currency,
}: CurrencyDetailsType = {
  currency: "EUR",
  currencySymbol: "€",
  thousandsSeparator: ".",
  decimalSeparator: ",",
  locale: "de-DE",
};

describe("currencyFormatter functionality", () => {
  it("returns empty string for empty input", () => {
    expect(
      currencyFormatter("", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "",
      value: 0,
    });
  });

  it("preserves a trailing comma", () => {
    expect(
      currencyFormatter("1234,", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,",
      value: 1234,
    });
  });

  it("is idempotent for already-formatted values with dot thousands + comma decimal", () => {
    expect(
      currencyFormatter("1.234,5", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,5",
      value: 1234.5,
    });
    expect(
      currencyFormatter("1.234,56", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,56",
      value: 1234.56,
    });
  });
});

describe("currencyFormatter expected behaviours", () => {
  it("should returns the expected outcomes when typing", () => {
    expect(
      currencyFormatter("1", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1",
      value: 1,
    });
    expect(
      currencyFormatter("1.", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1",
      value: 1,
    });
    expect(
      currencyFormatter("1234", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234",
      value: 1234,
    });
    expect(
      currencyFormatter("1234,", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,",
      value: 1234,
    });
    expect(
      currencyFormatter("1234,5", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,5",
      value: 1234.5,
    });
    expect(
      currencyFormatter("1234,50", {
        decimalSeparator,
        thousandsSeparator,
        locale,
        currency,
      })
    ).toStrictEqual({
      formattedValue: "1.234,50",
      value: 1234.5,
    });
  });
});
