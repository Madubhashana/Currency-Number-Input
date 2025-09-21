# Currency Number Input (React 18 + TypeScript)

A reusable `<CurrencyInput />` component for entering **EUR** amounts with **period (.)** as the thousands separator and **comma (,)** as the decimal separator. Always formats to **two decimals on blur**, and treats the **numpad decimal key** as the decimal separator regardless of OS/keyboard layout.

> NOTE:
> All the timestamps based on the git commits are attached in `timestamp.md` file.
>
> Start: 9f6c57d | 2025-09-21 16:06:40 +0530 | init: Setup React app with tests
>
> End: 729d57f | 2025-09-21 19:51:24 +0530 | finalize the must have features
>
> Time for main features: 3hrs and 51 mins
>
> Nice to have features:
>
> - Component can be used as uncontrolled component
> - Live separators while typing
> - min/max functionality
> - showSymbol prop
> - Currency conversion
> - Locale switching

## Getting Started

This project uses Create React App (react-scripts@5) with React 18 and TypeScript. A minimal demo is included via CRA:

```bash
pnpm install
pnpm start
```

Then open http://localhost:3000
.
The demo shows a controlled <CurrencyInput /> with live thousand separators and two-decimal formatting on blur.

## Parsing & Formatting Strategy

- **Sanitization first:** keep only digits, `.` and `,` for all edits (typing and paste). Treat `.` as thousands, `,` as decimal.
- **Intl with dynamic config:** utilizes `Intl.NumberFormat` with **dynamic custom configuration** as needed (e.g., `locale`, `currency`, `style`, `minimumFractionDigits`, `maximumFractionDigits`). This allows switching locales/currencies or toggling fraction precision without changing core logic.
- **Single entry point (onChange):** the main strategy is to have **one place** that formats the text—`onChange`. All edit paths (typing, paste, programmatic updates) ultimately route through `onChange`, ensuring consistent live formatting rules.
- **Numpad decimal override → onChange:** strategically intercept the **NumpadDecimal** press and rewrite the pending character to `,` (via `beforeinput`/`setRangeText`) and then dispatch a native `input` so it’s **adopted by `onChange`** (the single entry point).
- **Typing flow:** `keydown → beforeinput` (optionally rewrite `.` to `,`) → native `input` → `onChange` formats with current rules and (optionally) reinserts thousands separators.
- **Paste flow:** capture clipboard text, sanitize/normalize markers, then hand off to `onChange` for consistent formatting.
- **Blur normalization:** when leaving the field, normalize to two decimals (or the configured fraction policy) using `Intl.NumberFormat`, preserving thousands separators.
- **Caret safety:** when rewriting characters or inserting separators, use `setRangeText` and restore selection so the caret remains intuitive.
- **Rounding policy:** round to the nearest cent - 2 digits.

## Component API

### `<CurrencyInput />`

A currency-aware text input (EUR style: `.` thousands, `,` decimal).  
**Controlled by default**, with **uncontrolled compatibility** when `value` is omitted.

#### Props

| Prop       | Type                                                                                   | Default | Required | Description                                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`    | `string`                                                                               | —       | No       | Controlled value shown in the input. Localized string such as `"1.234,"`, `"1.234,5"`, `"1.234,56"`. If omitted, the component manages its own internal value (uncontrolled-compatible). |
| `onChange` | `(next: string, event: React.ChangeEvent<HTMLInputElement>) => void`                   | —       | No\*     | Called after any user edit (typing, paste, numpad decimal rewrite). `next` is the **sanitized / partially formatted** text. **Required in controlled usage** to lift state.              |
| `onBlur`   | `(next: string, event: React.FocusEvent<HTMLInputElement>) => void`                    | —       | No       | Called when the input loses focus. Use this to **normalize/round** (e.g., to two decimals) and persist.                                                                                  |
| …rest      | `Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" \| "onChange" \| "onBlur">` | —       | —        | All standard `<input>` props are forwarded (e.g., `placeholder`, `id`, `name`, `autoComplete`, `inputMode="decimal"`, `data-testid`, `aria-*`, etc.).                                    |

> TypeScript:
>
> ```ts
> type InputPropsType = Omit<
>   React.InputHTMLAttributes<HTMLInputElement>,
>   "value" | "onChange" | "onBlur"
> >;
>
> type CurrencyInputPropsType = Readonly<{
>   value?: string;
>   onChange?: (
>     next: string,
>     event: React.ChangeEvent<HTMLInputElement>
>   ) => void;
>   onBlur?: (
>     next: string,
>     event: React.FocusEvent<HTMLInputElement, Element>
>   ) => void;
> }> &
>   InputPropsType;
> ```

#### Examples

**Un-Controlled (recommended)**

```tsx
<CurrencyInput value={amount} />
```

**Controlled**

```tsx
const [amount, setAmount] = React.useState("");

<CurrencyInput
  value={amount}
  onChange={(next) => setAmount(next)} // single entry point for live edits
  onBlur={(next) => setAmount(next)} // e.g., normalize to "1.234,50"
  placeholder="Amount"
  inputMode="decimal"
/>;
```
