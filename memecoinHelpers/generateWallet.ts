import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

export function generateWallet() {
  // Generate a new random keypair
  const keypair = Keypair.generate();

  // Get the public key in base58 format
  const publicKey = keypair.publicKey.toString();

  // Get the private key (secret key) as a byte array
  const secretKey = Buffer.from(keypair.secretKey).toString("base64");

  console.log("Public Key:", publicKey);
  console.log("Private Key (Base64):", secretKey);

  // To save the keypair to a file:
  fs.writeFileSync(
    "keypair.json",
    JSON.stringify({
      publicKey: publicKey,
      privateKey: secretKey,
    })
  );

  return { publicKey, secretKey };
}

// Only run if this file is being executed directly
if (require.main === module) {
  generateWallet();
}

// IMPORTANT SECURITY NOTES:
// 1. Never share your private key
// 2. Store it securely
// 3. Consider using a hardware wallet for production use
// // 4. The file 'keypair.json' should be kept secure and not committed to version control
