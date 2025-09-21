import { testUtilFunction } from "../utilts";

describe("testUtilFunction", () => {
  it("should return the sum of two positive numbers", () => {
    expect(testUtilFunction(2, 3)).toBe(5);
  });

  it("should return the sum of a positive and negative number", () => {
    expect(testUtilFunction(10, -4)).toBe(6);
  });

  it("should return the sum when one number is zero", () => {
    expect(testUtilFunction(7, 0)).toBe(7);
  });

  it("should return the sum of two negative numbers", () => {
    expect(testUtilFunction(-5, -8)).toBe(-13);
  });
});
