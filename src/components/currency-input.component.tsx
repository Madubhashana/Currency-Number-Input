import { ChangeEventHandler, useState } from "react";
import { currencyFormatter, decimalFormatter } from "../lib/utilts";
import { DEFAULT_CURRENCY_DECIMALS } from "../config/constants";

const CurrencyInput = () => {
  const [currencyValye, setCurrencyValye] = useState<string>("");

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputType = (e.nativeEvent as InputEvent).inputType;
    const fractionDigits =
      inputType === "insertFromPaste" ||
      inputType === "insertFromPasteAsQuotation"
        ? DEFAULT_CURRENCY_DECIMALS
        : undefined;

    const formattedValue = currencyFormatter(e.target.value, {
      fractionDigits,
    });
    setCurrencyValye(formattedValue);
  };

  const handleOnBlur = () => {
    if (!currencyValye.length) {
      return;
    }
    setCurrencyValye((value) => decimalFormatter(value));
  };

  return (
    <div>
      <label>Currency Input</label>
      <input
        value={currencyValye}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        id="currency-input"
        data-testid="currency-input"
      />
    </div>
  );
};

export default CurrencyInput;
