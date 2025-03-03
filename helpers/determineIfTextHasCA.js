// Compile regex pattern once at module level for better performance
const SOLANA_ADDRESS_REGEX = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

export function determineIfTextHasCA(text) {
  const matches = text.match(SOLANA_ADDRESS_REGEX);
  return matches ? matches[0] : null;
}

/**
 * Extracts all potential Solana addresses from a text string
 * @param {string} text - The text to search for Solana addresses
 * @returns {string[]} Array of potential Solana addresses found in the text
 */
function extractSolanaAddresses(text) {
  return text.match(SOLANA_ADDRESS_REGEX) || [];
}
