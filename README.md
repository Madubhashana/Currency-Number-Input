# Currency Number Input (React 18 + TypeScript)

A reusable `<CurrencyInput />` component for entering **EUR** amounts with **period (.)** as the thousands separator and **comma (,)** as the decimal separator. Always formats to **two decimals on blur**, and treats the **numpad decimal key** as the decimal separator regardless of OS/keyboard layout.

## Table of Contents

- [Getting Started](#getting-started)

---

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

## Parsing & Formatting Strategy

- **Sanitization first:** keep only digits, `.` and `,` for all edits (typing and paste). Treat `.` as thousands, `,` as decimal.
- **Intl with dynamic config:** utilizes `Intl.NumberFormat` with **dynamic custom configuration** as needed (e.g., `locale`, `currency`, `style`, `minimumFractionDigits`, `maximumFractionDigits`). This allows switching locales/currencies or toggling fraction precision without changing core logic.
- **Single entry point (onChange):** the main strategy is to have **one place** that formats the text—`onChange`. All edit paths (typing, paste, programmatic updates) ultimately route through `onChange`, ensuring consistent live formatting rules.
- **Numpad decimal override → onChange:** strategically intercept the **NumpadDecimal** press and rewrite the pending character to `,` (via `beforeinput`/`setRangeText`) and then dispatch a native `input` so it’s **adopted by `onChange`** (the single entry point).
- **Typing flow:** `keydown → beforeinput` (optionally rewrite `.` to `,`) → native `input` → `onChange` formats with current rules and (optionally) reinserts thousands separators.
- **Paste flow:** capture clipboard text, sanitize/normalize markers, then hand off to `onChange` for consistent formatting.
- **Blur normalization:** when leaving the field, normalize to two decimals (or the configured fraction policy) using `Intl.NumberFormat`, preserving thousands separators.
- **Caret safety:** when rewriting characters or inserting separators, use `setRangeText` and restore selection so the caret remains intuitive.
