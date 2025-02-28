export async function determineIfTextHasCA(tweetObj) {
  const { username, text } = tweetObj;

  // Solana addresses are base58-encoded strings, typically 32-44 characters
  // They consist of alphanumeric characters excluding 0, O, I, and l
  const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

  // Find all potential matches
  const matches = text.match(solanaAddressRegex);

  if (!matches) {
    return null;
  }

  // Additional validation could be added here if needed
  // For example, checking if the address starts with specific characters
  // or validating the checksum if implementing full base58 validation

  return matches[0];
}

/**
 * Extracts all potential Solana addresses from a text string
 * @param {string} text - The text to search for Solana addresses
 * @returns {string[]} Array of potential Solana addresses found in the text
 */
function extractSolanaAddresses(text) {
  const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const matches = text.match(solanaAddressRegex) || [];
  return matches;
}
