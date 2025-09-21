import {
  ChangeEventHandler,
  KeyboardEventHandler,
  InputEventHandler,
  FocusEventHandler,
  ChangeEvent,
  FocusEvent,
  useRef,
  useState,
  useEffect,
} from "react";
import { currencyFormatter, decimalFormatter } from "../lib/utilts";
import { DEFAULT_CURRENCY_DECIMALS } from "../config/constants";

type InputPropsType = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onBlur"
>;

/**
 * Props for {@link CurrencyInput}.
 *
 * Controlled-first: pass `value` and handle `onChange`. If `value` is omitted,
 * the component behaves in uncontrolled mode and manages its own internal value.
 *
 * All standard `<input>` attributes are accepted (except `value`, `onChange`, `onBlur`
 * which are typed below with currency-aware signatures).
 *
 * @typedef {Object} CurrencyInputPropsType
 * @property {string} [value]
 *   Controlled value (localized). If omitted, component is uncontrolled-compatible.
 * @property {(next: string, event: React.ChangeEvent<HTMLInputElement>) => void} [onChange]
 *   Called after each edit; `next` is the sanitized/partially formatted string.
 * @property {(next: string, event: React.FocusEvent<HTMLInputElement>) => void} [onBlur]
 *   Called on blur; typically used to normalize precision and persist.
 */
type CurrencyInputPropsType = Readonly<{
  value?: string;
  onChange?: (next: string, event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (next: string, event: FocusEvent<HTMLInputElement, Element>) => void;
}> &
  InputPropsType;

/**
 * A text input specialized for currency editing with localized separators.
 *
 * **Controlled by default**: The parent is the source of truth via the `value` prop.
 * If `value` is omitted, the component gracefully falls back to **uncontrolled mode**
 * by managing its own internal `currencyValue` (uncontrolled-compatible).
 *
 * Accessibility:
 * - Forwards all standard input attributes via `delegated` props.
 *
 * @example
 *
 * function Example() {
 *   const [amount, setAmount] = React.useState("");
 *   return (
 *     <CurrencyInput
 *       value={amount}
 *       onChange={(next) => setAmount(next)}
 *       onBlur={(next) => setAmount(next)} // e.g., normalize to "1.234,50"
 *       placeholder="Amount"
 *     />
 *   );
 * }
 */

const CurrencyInput = ({
  value,
  onChange,
  onBlur,
  ...delegated
}: CurrencyInputPropsType) => {
  const _isNumberpadDecimal = useRef<boolean>(false);
  const [currencyValue, setCurrencyValue] = useState<string>(() => value ?? ""); // Lazy initialization avoid unnecessary re-renders

  useEffect(() => {
    /* Uncontrolled value updates
     * Updates the component's value (currencyValue) each time
     * when the uncrolled value gets changed.
     */
    if (value !== undefined && value !== currencyValue) {
      setCurrencyValue(value);
    }
  }, [value, currencyValue]);

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

    onChange?.(formattedValue, e);
    setCurrencyValue(formattedValue);
  };

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    if (!currencyValue.length) {
      return;
    }

    const formattedValue = decimalFormatter(currencyValue);

    onBlur?.(formattedValue, e);
    setCurrencyValue(formattedValue);
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
    <div className="input-container">
      <label>Currency Input</label>
      <br />
      <input
        value={currencyValue}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        id="currency-input"
        data-testid="currency-input"
        onKeyDown={handleOnkeyDown}
        onBeforeInput={handleOnBeforeInput}
        {...delegated}
      />
    </div>
  );
};

export default CurrencyInput;
