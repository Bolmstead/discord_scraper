import player from "play-sound";

/**
 * Extracts the username from a string that starts with @
 * @param {string} text - The input text (e.g. '@maxkeiser')
 * @returns {string} - The username without @ symbol, or empty string if not found
 */
export function extractNameFromParentheses(text) {
  try {
    if (!text) return "";

    const atSymbolRegex = /@(\w+)/;
    const match = text.match(atSymbolRegex);

    if (match && match[1]) {
      const username = match[1];
      return username;
    }
    const sound = player();
    sound.play("./sounds/error.mp3", (err) => {
      if (err) console.log("Could not play sound:", err);
    });
    return "unable to extractNameFromParentheses";
  } catch (error) {
    console.error("Error in extractNameFromParentheses:", error);

    // Play error sound when an actual error occurs
    const sound = player();
    sound.play("./sounds/error.mp3", (err) => {
      if (err) console.log("Could not play sound:", err);
    });

    return "unable to extractNameFromParentheses";
  }
}
