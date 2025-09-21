import React, { ChangeEventHandler, useState } from "react";
import { currencyFormatter } from "../lib/utilts";

const CurrencyInput = () => {
  const [currencyValye, setCurrencyValye] = useState<string>("");

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const formattedValue = currencyFormatter(e.target.value);
    setCurrencyValye(formattedValue);
  };

  return (
    <div>
      <label>Currency Input</label>
      <input value={currencyValye} onChange={handleOnChange} />
    </div>
  );
};

export default CurrencyInput;
