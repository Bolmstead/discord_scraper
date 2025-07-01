/**
 * Extracts the username from a string that starts with @
 * @param {string} text - The input text (e.g. '@maxkeiser')
 * @returns {string} - The username without @ symbol, or empty string if not found
 */
export function extractNameFromParentheses(text) {
  if (!text) return "";

  const atSymbolRegex = /@(\w+)/;
  const match = text.match(atSymbolRegex);
  console.log("🚀 ~ extractNameFromParentheses ~ match:", match);

  if (match && match[1]) {
    const username = match[1];
    console.log("🚀 ~ extractNameFromParentheses ~ username:", username);
    return username;
  }

  return "unable to extractNameFromParentheses";
}
