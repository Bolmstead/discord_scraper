import { createJupiterApiClient } from "@jup-ag/api";
import {
  Connection,
  Keypair,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import bs58 from "bs58";
import { transactionSenderAndConfirmationWaiter } from "./utils/transactionSender.js";
import { getSignature } from "./utils/getSignature.js";
import dotenv from "dotenv";

dotenv.config();

// If you have problem landing transactions, read this: https://station.jup.ag/docs/swap-api/send-swap-transaction#how-jupiter-estimates-priority-fee

// Make sure that you are using your own RPC endpoint.
// Helius and Triton have staked SOL and they can usually land transactions better.
const connection = new Connection(
  "https://api.mainnet-beta.solana.com" // We only support mainnet.
);
const jupiterQuoteApi = createJupiterApiClient();

// --------- config ---------

const DEFAULT_AMOUNT_TO_BUY = null;

async function getQuote(inputMint, outputMint, amount, slippageBps) {
  console.log(
    "🚀 ~ getQuote ~ inputMint, outputMint, amount, slippageBps:",
    inputMint,
    outputMint,
    amount,
    slippageBps
  );

  // get quote
  const quote = await jupiterQuoteApi.quoteGet({
    inputMint,
    outputMint,
    amount,
    slippageBps,
  });
  console.log("🚀 ~ getQuote ~ quote:", quote);
  if (!quote) {
    throw new Error("unable to quote");
  }
  return quote;
}

async function getSwapResponse(wallet, quote) {
  // Get serialized transaction
  const swapResponse = await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toString(),
      dynamicComputeUnitLimit: true,
      dynamicSlippage: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 10000000,
          priorityLevel: "veryHigh", // If you want to land transaction fast, set this to use `veryHigh`. You will pay on average higher priority fee.
        },
      },
    },
  });
  return swapResponse;
}

async function flowQuote() {
  const quote = await getQuote();
  console.dir(quote, { depth: null });
}

async function flowQuoteAndSwap() {
  const wallet = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY || "")
  );
  console.log("Wallet:", wallet.publicKey.toString());

  const quote = await getQuote();
  console.log("🚀 ~ flowQuoteAndSwap ~ quote:", quote);
  const swapResponse = await getSwapResponse(wallet, quote);
  console.log("🚀 ~ flowQuoteAndSwap ~ swapResponse:", swapResponse);

  // Serialize the transaction
  const swapTransactionBuf = Uint8Array.from(
    Buffer.from(swapResponse.swapTransaction, "base64")
  );
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // Sign the transaction
  transaction.sign([wallet]);
  const signature = getSignature(transaction);

  // We first simulate whether the transaction would be successful
  const { value: simulatedTransactionResponse } =
    await connection.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
  const { err, logs } = simulatedTransactionResponse;

  if (err) {
    // Simulation error, we can check the logs for more details
    // If you are getting an invalid account error, make sure that you have the input mint account to actually swap from.
    console.error("Simulation Error:");
    console.error({ err, logs });
    return;
  }

  const serializedTransaction = Buffer.from(transaction.serialize());
  const blockhash = transaction.message.recentBlockhash;

  const transactionResponse = await transactionSenderAndConfirmationWaiter({
    connection,
    serializedTransaction,
    blockhashWithExpiryBlockHeight: {
      blockhash,
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
    },
  });

  // If we are not getting a response back, the transaction has not confirmed.
  if (!transactionResponse) {
    console.error("Transaction not confirmed");
    return;
  }

  if (transactionResponse.meta?.err) {
    console.error(transactionResponse.meta?.err);
  }

  console.log(`https://solscan.io/tx/${signature}`);
}

async function executeSwap(
  buyOrSell,
  name = "????",
  ticker = "????",
  outputMint,
  timeToSell = 90 * 1000,
  keywords = [],
  amountToBuy = 1,
  slippageBps = 20000,
  priorityFee = 0.05,
  inputMint = "So11111111111111111111111111111111111111112"
) {
  console.log("🚀 ~ executeSwap ~ buyOrSell:", buyOrSell);
  console.log("🚀 ~ executeSwap ~ name:", name);
  console.log("🚀 ~ executeSwap ~ ticker:", ticker);
  console.log("🚀 ~ executeSwap ~ outputMint:", outputMint);
  console.log("🚀 ~ executeSwap ~ timeToSell:", timeToSell);
  console.log("🚀 ~ executeSwap ~ keywords:", keywords);
  console.log("🚀 ~ executeSwap ~ amountToBuy:", amountToBuy);
  console.log("🚀 ~ executeSwap ~ slippageBps:", slippageBps);
  console.log("🚀 ~ executeSwap ~ priorityFee:", priorityFee);
  console.log("🚀 ~ executeSwap ~ inputMint:", inputMint);
  if (buyOrSell !== "sell" && buyOrSell !== "buy") {
    console.error("Invalid buyOrSell value");
    return null;
  }

  if (buyOrSell !== "sell" && buyOrSell !== "buy") {
    console.log("🚀 ~ executeSwap ~ sell:", {
      name,
      ticker,
    });
  }
  // Early validation to prevent unnecessary processing
  if (!outputMint || !inputMint) {
    console.error("Missing required mint addresses");
    return null;
  }

  // Single log for trade parameters
  console.log("Trade Parameters:", {
    buyOrSell,
    name,
    ticker,
    outputMint,
    timeToSell,
    keywords,
    amountToBuy,
  });

  // Validate amount and adjust if needed
  if (amountToBuy === 0 || amountToBuy > 15) {
    console.log(
      `Skipping ${name}: amount ${amountToBuy} outside valid range (0-15)`
    );
    return null;
  }

  // ####### REMOVE THIS #######
  if (DEFAULT_AMOUNT_TO_BUY) {
    amountToBuy = DEFAULT_AMOUNT_TO_BUY;
  }
  // ###########################

  const amountToBuyLamports = amountToBuy * LAMPORTS_PER_SOL;

  try {
    // Initialize wallet once
    const wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );

    // Get quote and prepare swap
    const quote = await getQuote(
      inputMint,
      outputMint,
      amountToBuyLamports,
      slippageBps
    );

    if (!quote) {
      console.error("Failed to get quote");
      return null;
    }

    const swapResponse = await getSwapResponse(wallet, quote);
    if (!swapResponse) {
      console.error("Failed to get swap response");
      return null;
    }

    // Prepare transaction (reuse Buffer to avoid extra allocation)
    const transactionBuffer = Buffer.from(
      swapResponse.swapTransaction,
      "base64"
    );
    const transaction = VersionedTransaction.deserialize(
      Uint8Array.from(transactionBuffer)
    );

    // Sign and get signature in one step
    transaction.sign([wallet]);
    const signature = getSignature(transaction);

    // Simulate transaction
    const { value: simulated } = await connection.simulateTransaction(
      transaction,
      {
        replaceRecentBlockhash: true,
        commitment: "processed",
      }
    );

    if (simulated.err) {
      console.error("Simulation failed:", {
        error: simulated.err,
        logs: simulated.logs,
      });
      return null;
    }

    // Prepare and send transaction
    const serializedTx = transaction.serialize();
    const txResponse = await transactionSenderAndConfirmationWaiter({
      connection,
      serializedTransaction: Buffer.from(serializedTx),
      blockhashWithExpiryBlockHeight: {
        blockhash: transaction.message.recentBlockhash,
        lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      },
    });

    // Check transaction result
    if (!txResponse) {
      console.error("Transaction not confirmed");
      return null;
    }

    if (txResponse.meta?.err) {
      console.error("Transaction error:", txResponse.meta.err);
      return null;
    }

    console.log(`Transaction successful: https://solscan.io/tx/${signature}`);
    return true;
  } catch (error) {
    console.error("Swap execution failed:", error.message);
    return null;
  }
}

async function getTokenBalance(tokenMint) {
  try {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );

    // Convert token mint string to PublicKey
    const mintPubkey = new PublicKey(tokenMint);

    // Get the associated token account address
    const tokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      wallet.publicKey
    );

    try {
      // Get the token account info
      const account = await getAccount(connection, tokenAccount);

      // Return the balance
      return {
        success: true,
        balance: Number(account.amount),
        decimals: account.decimals,
        formattedBalance:
          Number(account.amount) / Math.pow(10, account.decimals),
      };
    } catch (error) {
      if (error.message.includes("Account does not exist")) {
        return {
          success: true,
          balance: 0,
          decimals: 0,
          formattedBalance: 0,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error getting token balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export the individual functions for use in other files
export {
  getQuote,
  getSwapResponse,
  flowQuote,
  flowQuoteAndSwap,
  executeSwap,
  getTokenBalance,
  connection,
  jupiterQuoteApi,
};
