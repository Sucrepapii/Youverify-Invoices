function isValidText(value, minLength = 1) {
  return typeof value === "string" && value.trim().length >= minLength;
}

function isValidDate(value) {
  const date = new Date(value);
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    date.toString() !== "Invalid Date"
  );
}

function isValidImageUrl(value) {
  return typeof value === "string" && value.startsWith("http");
}

function isValidEmail(value) {
  return typeof value === "string" && value.includes("@");
}

exports.isValidText = isValidText;
exports.isValidDate = isValidDate;
exports.isValidImageUrl = isValidImageUrl;
exports.isValidEmail = isValidEmail;
