import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencyInput from "../currency-input.component";

test("renders currency input", () => {
  render(<CurrencyInput />);
  const linkElement = screen.getByText(/Currency Input/i);
  expect(linkElement).toBeInTheDocument();
});

describe("Currency Input - paste behavior", () => {
  it("should show the formatted value", async () => {
    render(<CurrencyInput aria-label="amount" />);

    const input = screen.getByTestId("currency-input") as HTMLInputElement;

    await userEvent.paste(input, "1234,5");

    // And should show the sanitized value in the input
    await waitFor(() => {
      expect(input.value).toBe("1.234,50");
    });
  });

  it("should show the formatted value with rounded decimals", async () => {
    render(<CurrencyInput aria-label="amount" />);

    const input = screen.getByTestId("currency-input") as HTMLInputElement;

    await userEvent.paste(input, "1.234,567");

    // And should show the sanitized value in the input
    await waitFor(() => {
      expect(input.value).toBe("1.234,57");
    });
  });
});
