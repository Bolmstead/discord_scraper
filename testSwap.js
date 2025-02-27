import "dotenv/config";

import { executeSwap } from "./jupiter/jupiterFunctions.js";

await executeSwap(
  "Peanut the Squirrel",
  "Pnut",
  "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
  90 * 1000,
  ["pnut", "peanut"],
  0.001,
  5000,
  0.05
);
