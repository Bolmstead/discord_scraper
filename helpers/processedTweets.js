const processedPostFingerprints = [];
const processedPostFingerprintSet = new Set();
const MAX_PROCESSED_POST_FINGERPRINTS = 500;

export function getTweetFingerprint(tweet) {
  const username = String(tweet?.username || "")
    .trim()
    .toLowerCase();
  const normalizedText = String(tweet?.text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return `${username}:${normalizedText.slice(0, 400)}`;
}

export function hasProcessedTweet(tweet) {
  return processedPostFingerprintSet.has(getTweetFingerprint(tweet));
}

export function markTweetProcessed(tweet) {
  const fingerprint = getTweetFingerprint(tweet);
  if (!fingerprint || processedPostFingerprintSet.has(fingerprint)) {
    return;
  }

  processedPostFingerprintSet.add(fingerprint);
  processedPostFingerprints.push(fingerprint);

  if (processedPostFingerprints.length > MAX_PROCESSED_POST_FINGERPRINTS) {
    const removed = processedPostFingerprints.shift();
    if (removed) {
      processedPostFingerprintSet.delete(removed);
    }
  }
}
