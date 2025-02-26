const {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} = require("@solana/web3.js");
const fetch = require("node-fetch");
const bs58 = require("bs58");

/**
 * Swap between any tokens on Solana using Jupiter
 * @param {Object} params - Swap parameters
 * @param {string} params.rpcUrl - Solana RPC URL, defaults to mainnet-beta
 * @param {string} params.privateKey - Private key in base58 format
 * @param {string} params.inputMint - Input token mint address
 * @param {string} params.outputMint - Output token mint address
 * @param {number} params.amount - Amount in smallest units (lamports for SOL)
 * @param {number} params.slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
 * @param {boolean} params.wrapUnwrapSOL - Auto wrap/unwrap SOL (default: true)
 * @returns {Promise<string>} - Transaction signature
 */
async function swapOnJupiter({
  rpcUrl = "https://api.mainnet-beta.solana.com",
  privateKey,
  inputMint,
  outputMint,
  amount,
  slippageBps = 50,
  wrapUnwrapSOL = true,
}) {
  if (amount > 20) {
    throw new Error("Amount must be less than 20");
  }
  // Connection to Solana network
  const connection = new Connection(rpcUrl, "confirmed");

  // Load wallet from private key
  const privateKeyBytes = bs58.decode(
    privateKey || process.env.TEST_WALLET_PRIVATE_KEY
  );
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  // Convert mint addresses to PublicKey objects
  const inputMintPubkey = new PublicKey(inputMint);
  const outputMintPubkey = new PublicKey(outputMint);

  const amountInLamports = amount * 10 ** 9;

  // 1. Query Jupiter API for quote
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?inputMint=${inputMintPubkey.toString()}&outputMint=${outputMintPubkey.toString()}&amount=${amountInLamports}&slippageBps=${slippageBps}`
  );

  const quoteData = await quoteResponse.json();
  console.log("🚀 ~ quoteData:", quoteData);

  if (!quoteData || !quoteData.quoteResponse) {
    throw new Error("Failed to get quote from Jupiter");
  }

  // 2. Get swap instructions from Jupiter
  const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quoteResponse: quoteData.quoteResponse,
      userPublicKey: wallet.publicKey.toString(),
      wrapAndUnwrapSol: wrapUnwrapSOL,
    }),
  });

  const swapData = await swapResponse.json();
  console.log("🚀 ~ swapData:", swapData);

  if (!swapData || !swapData.swapTransaction) {
    throw new Error("Failed to get swap transaction from Jupiter");
  }

  // 3. Deserialize and sign the transaction
  const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");
  const transaction = Transaction.from(swapTransactionBuf);

  // 4. Execute the transaction
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      { skipPreflight: false, commitment: "confirmed" }
    );

    console.log("Swap completed successfully!");
    console.log(`Transaction signature: ${signature}`);
    console.log(
      `View on Solana Explorer: https://explorer.solana.com/tx/${signature}`
    );

    return signature;
  } catch (error) {
    console.error("Error executing swap transaction:", error);
    throw error;
  }
}

// Export the function for use in other modules
module.exports = { swapOnJupiter };
