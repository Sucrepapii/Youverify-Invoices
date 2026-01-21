const {
  isValidText,
  isValidDate,
  isValidEmail,
  isValidImageUrl,
} = require("./validation");

describe("Validation Utilities", () => {
  test("isValidText returns true for valid non-empty text", () => {
    expect(isValidText("Hello")).toBe(true);
  });

  test("isValidText returns false for empty string", () => {
    expect(isValidText("")).toBe(false);
  });

  test("isValidText returns false for null/undefined", () => {
    expect(isValidText(null)).toBe(false);
    expect(isValidText(undefined)).toBe(false);
  });

  test("isValidText correctly checks minimum length", () => {
    expect(isValidText("12345", 6)).toBe(false);
    expect(isValidText("123456", 6)).toBe(true);
  });

  test("isValidEmail returns true for valid email", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  test("isValidEmail returns false for invalid email", () => {
    expect(isValidEmail("invalid-email")).toBe(false);
  });

  test("isValidDate returns true for valid date string", () => {
    expect(isValidDate("2023-01-01")).toBe(true);
  });

  test("isValidDate returns false for invalid date string", () => {
    expect(isValidDate("invalid-date")).toBe(false);
  });
});
