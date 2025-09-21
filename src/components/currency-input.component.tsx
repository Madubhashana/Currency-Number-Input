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
import { currencyFormatter, getCurrencyDetailsByLocale } from "../lib/utilts";
import {
  DEFAULT_CURRENCY_DECIMALS,
  LOCALE_CURRENCY_MAP,
} from "../config/constants";
import {
  CurrencyDetailsType,
  CurrencyFormatterReturnType,
  LocaleType,
} from "../types";

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
  min?: number;
  max?: number;
  showSymbol?: boolean;
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
  min,
  max,
  showSymbol = true,
  onChange,
  onBlur,
  ...delegated
}: CurrencyInputPropsType) => {
  const _isNumberpadDecimal = useRef<boolean>(false);
  const _numericValue = useRef<number>();
  const [currencyValue, setCurrencyValue] = useState<string>(() => value ?? ""); // Lazy initialization avoid unnecessary re-renders
  const [selectedCurrencyData, setSelectedCurrencyData] =
    useState<CurrencyDetailsType>(() => DefaultCurrencyData);

  const [validationErrors, setValidationErrors] = useState<
    string | undefined
  >();

  //14500.5

  useEffect(() => {
    /* Uncontrolled value updates
     * Updates the component's value (currencyValue) each time
     * when the uncrolled value gets changed.
     */
    if (value !== undefined && value !== currencyValue) {
      setCurrencyValue(value);
    }
  }, [value, currencyValue]);

  useEffect(() => {
    if (selectedCurrencyData && _numericValue.current) {
      updateCurrencyValue(
        _numericValue.current
          .toString()
          .replace(".", selectedCurrencyData.decimalSeparator),
        DEFAULT_CURRENCY_DECIMALS
      );
    }

    /*
     * This effect should be triggered only when the selectedCurrencyData.locale gets changed.
     * It should not depend on currencyValue or updateCurrencyValue.
     */

    // eslint-disable-next-line
  }, [selectedCurrencyData.locale]);

  const updateCurrencyValue = (
    amount: string,
    fractionDigits?: number
  ): CurrencyFormatterReturnType | void => {
    /*
     * This is the single entry point of formatting & validating monetary value.
     */
    const { formattedValue, value } = currencyFormatter(amount, {
      fractionDigits,
      locale: selectedCurrencyData.locale,
      currency: selectedCurrencyData.currency,
      decimalSeparator: selectedCurrencyData.decimalSeparator,
      thousandsSeparator: selectedCurrencyData.thousandsSeparator,
    });

    _numericValue.current = value;

    setValidationErrors(undefined);

    if (max !== undefined && value > max) {
      setValidationErrors(`Amount should not be greater than ${max}`);
      return;
    }

    if (min !== undefined && value < min && formattedValue?.length) {
      setValidationErrors(`Amount should not be less than ${min}`);
    }

    setCurrencyValue(formattedValue);

    return { formattedValue, value };
  };

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!selectedCurrencyData) return;

    const inputType = (e.nativeEvent as InputEvent).inputType;

    // If the value is pasted from the clipboard,
    // the decimals should be rounded to 2 digits.
    const fractionDigits =
      inputType === "insertFromPaste" ||
      inputType === "insertFromPasteAsQuotation"
        ? DEFAULT_CURRENCY_DECIMALS
        : undefined;

    const data = updateCurrencyValue(e.target.value, fractionDigits);

    if (data) {
      onChange?.(data.formattedValue, e);
    }
  };

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    if (!currencyValue.length) {
      return;
    }

    // If the input is blurred,
    // the decimals should be rounded to 2 digits.
    const data = updateCurrencyValue(e.target.value, DEFAULT_CURRENCY_DECIMALS);

    if (data) {
      onBlur?.(data.formattedValue, e);
    }
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

  const handleOnChangeLocale: ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (e.target.value === selectedCurrencyData?.locale) {
      return;
    }

    const currencyDetails = getCurrencyDetailsByLocale(e.target.value);

    if (currencyDetails) {
      setSelectedCurrencyData(currencyDetails);
    }
  };

  const renderLocale = (locale: LocaleType) => {
    return (
      <option value={locale.code} key={locale.code}>
        {locale.name}
      </option>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="currency-input-container">
        <div className="input-container">
          <label>Currency Input</label>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
            {showSymbol && (
              <span className="currency-symbol">
                {selectedCurrencyData.currencySymbol}
              </span>
            )}
          </div>
        </div>

        <div className="input-container">
          <label>Locale</label>
          <select
            name="pets"
            id="locale-select"
            onChange={handleOnChangeLocale}
            value={selectedCurrencyData.locale}
          >
            {LOCALE_CURRENCY_MAP.map(renderLocale)}
          </select>
        </div>
      </div>

      {validationErrors ? (
        <span className="form-error" data-testid="form-error-message">
          {validationErrors}
        </span>
      ) : null}
    </div>
  );
};

export const DefaultCurrencyData = getCurrencyDetailsByLocale(
  "de-DE"
) as CurrencyDetailsType;

export default CurrencyInput;
