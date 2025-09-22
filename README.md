# Currency Number Input (React 18 + TypeScript)

A reusable `<CurrencyInput />` component for entering **EUR** amounts with **period (.)** as the thousands separator and **comma (,)** as the decimal separator. Always formats to **two decimals on blur**, and treats the **numpad decimal key** as the decimal separator regardless of OS/keyboard layout.

> NOTE:
> All the timestamps based on the git commits are loggde in `timestamp.md` file.
>
> Day 1 <br/> **Start (Must have features)**: 9f6c57d | 2025-09-21 16:06:40 +0530 | init: Setup React app with tests<br/> **End (Must have features)**: 729d57f | 2025-09-21 19:51:24 +0530 | finalize the must have features
>
> Time for Must have features: **3hrs and 51 mins**
>
> Nice to have features:
>
> - Component can be used as uncontrolled component
> - Live separators while typing
> - min/max functionality
> - showSymbol prop
> - Locale switching
>
> Day 2 <br/> **Refactor and Cleanup**: 19a59b8 | 2025-09-22 08:14:22 +0530 | update: refactor and cleanup<br/> **Setup github actions ci/cd to run unit-test**: a7576f3 | 2025-09-22 08:29:39 +0530 | setup ci/cd pipeline to run unit tests on github actions

## Getting Started

This project uses Create React App (react-scripts@5) with React 18 and TypeScript. A minimal demo is included via CRA:

```bash
pnpm install
pnpm start
```

Then open http://localhost:3000
.
The demo shows a controlled <CurrencyInput /> with live thousand separators and two-decimal formatting on blur.

Run unit tests

```bash
pnpm test
```

## Parsing & Formatting Strategy

- **Sanitization first:** convert the given currency input to the regular javascript number/float format and stringify.
- **Intl with dynamic config:** utilizes `Intl.NumberFormat` with **dynamic custom configuration** as needed (e.g., `locale`, `currency`, `style`, `minimumFractionDigits`, `maximumFractionDigits`). This allows switching locales/currencies or toggling fraction precision without changing core logic.
- **Single entry point:** the main strategy is to have **one place** that formats the text. All text edit paths (typing, paste) ultimately route through `onChange`, ensuring consistent live formatting rules.
- **Numpad decimal override → onChange:** strategically intercept the **NumpadDecimal** press and rewrite the pending character to `,` (or the corresponding decimal separator) via `beforeinput`/`setRangeText` and then dispatch a native `input` so it’s **adopted by `onChange`** (eventualy via the single entry point).
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

### Known Limitations / Trade-offs

- **Mixed-locale + symbol paste**

  **Goal (ideal behavior):** Handle pasted values that include a **currency symbol/code** and a **format that doesn’t match the symbol’s usual locale**, and still normalize to our target display (`de-DE`, i.e., `.` thousands and `,` decimal, two digits).

  **Example**

  - Paste: `€1,234.5` → **Display:** `1.234,50` (round/pad to two decimals)

  **Status:** Not implemented yet. Current paste logic strips symbols and normalizes common EU/US patterns, but it does not fully reconcile **symbol + mismatched separators** in a single pass.

  **Planned approach:**

  1. **Extract symbol/code** (e.g., `€`, `EUR`, `$`, `USD`) and strip it for parsing.
  2. **Detect separators** by shape:

  - Consider grouping validity (groups of 3) to identify thousands vs. decimal.
  - Treat spaces / thin spaces as potential thousands separators.

  3. **Normalize to target locale**:

  - Identify the locale by the currency (in step 1)
  - Round/pad to **two decimals** (“nearest cent”).

  4. **Reformat** with `currencyFormatter`.
