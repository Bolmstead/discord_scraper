import "dotenv/config";

import { executeSwap } from "./jupiter/index.js";

await executeSwap(
  "Berkley",
  "buy",
  "Pnut",
  "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
  true,
  ["pnut", "peanut"],
  0.001,
  5000,
  0.05
);
