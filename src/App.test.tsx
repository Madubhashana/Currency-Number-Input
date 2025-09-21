import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders test app", () => {
  render(<App />);
  const linkElement = screen.getByText(/test app/i);
  expect(linkElement).toBeInTheDocument();
});
