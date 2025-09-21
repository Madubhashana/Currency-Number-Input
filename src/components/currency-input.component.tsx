import {
  ChangeEventHandler,
  KeyboardEventHandler,
  InputEventHandler,
  useRef,
  useState,
} from "react";
import { currencyFormatter, decimalFormatter } from "../lib/utilts";
import { DEFAULT_CURRENCY_DECIMALS } from "../config/constants";

const CurrencyInput = () => {
  const _isNumberpadDecimal = useRef<boolean>(false);
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

  const handleOnkeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    // Detect the physical numpad-decimal key
    const isNumpadDecimal =
      e.code === "NumpadDecimal" ||
      (e.key === "." && e.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD);

    _isNumberpadDecimal.current = isNumpadDecimal;
  };

  const handleOnBeforeInput: InputEventHandler<HTMLInputElement> = (e) => {
    if (e.nativeEvent.type !== "textInput") return;

    // Only rewrite if the character is '.' and the prior keydown was NumpadDecimal.
    if (_isNumberpadDecimal.current && e.nativeEvent.data === ".") {
      e.preventDefault();

      // Intercepts the onChange event with modified value.
      const el = e.currentTarget as HTMLInputElement;
      el.setRangeText(",", el.selectionStart ?? 0, el.selectionEnd ?? 0, "end");
      el.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: ",",
          inputType: "insertText",
        })
      );
    }

    // Clear the flag for the next keystroke
    _isNumberpadDecimal.current = false;
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
        onKeyDown={handleOnkeyDown}
        onBeforeInput={handleOnBeforeInput}
      />
    </div>
  );
};

export default CurrencyInput;
