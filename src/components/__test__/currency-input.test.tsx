import React from "react";
import { render, screen } from "@testing-library/react";
import CurrencyInput from "../currency-input.component";

test("renders currency input", () => {
  render(<CurrencyInput />);
  const linkElement = screen.getByText(/Currency Input/i);
  expect(linkElement).toBeInTheDocument();
});
