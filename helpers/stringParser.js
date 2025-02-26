/**
 * Extracts the name from within parentheses in a Twitter-style string
 * @param {string} text - The input text (e.g. '@jason (@Jason)')
 * @returns {string|null} - The name within parentheses without @ symbol, or null if not found
 */
function extractNameFromParentheses(text) {
  const parenthesesRegex = /\([@]?([^)]+)\)/;
  const match = text.match(parenthesesRegex);

  if (match && match[1]) {
    // Return the captured group without any @ symbol
    return match[1].replace("@", "");
  }
  return null;
}

module.exports = {
  extractNameFromParentheses,
};
