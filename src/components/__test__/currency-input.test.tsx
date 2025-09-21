import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencyInput from "../currency-input.component";

test("renders currency input", () => {
  render(<CurrencyInput />);
  const linkElement = screen.getByText(/Currency Input/i);
  expect(linkElement).toBeInTheDocument();
});

describe("Currency Input - paste behavior", () => {
  it("should show the formatted value", async () => {
    render(<CurrencyInput />);

    const input = screen.getByTestId("currency-input") as HTMLInputElement;

    await userEvent.paste(input, "1234,5");

    // And should show the sanitized value in the input
    await waitFor(() => {
      expect(input.value).toBe("1.234,50");
    });
  });

  it("should show the formatted value with rounded decimals", async () => {
    render(<CurrencyInput />);

    const input = screen.getByTestId("currency-input") as HTMLInputElement;

    await userEvent.paste(input, "1.234,567");

    // And should show the sanitized value in the input
    await waitFor(() => {
      expect(input.value).toBe("1.234,57");
    });
  });
});

// TODO: Test library does not fire the onBeforeInput event! Investigate.
describe.skip("Numberpad Decimal separator", () => {
  it("should insert ',' when the Numberpad Decimal key is pressed", async () => {
    render(<CurrencyInput />);

    const input = screen.getByTestId("currency-input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "12" } });
    expect(input.value).toBe("12");

    input.setSelectionRange(4, 4);

    fireEvent.keyDown(input, {
      key: ".",
      code: "NumpadDecimal",
      location: 3, // DOM_KEY_LOCATION_NUMPAD
    });

    // onChange should have run due to dispatched 'input'
    await waitFor(() => {
      expect(input.value).toBe("12,");
    });
  });
});
