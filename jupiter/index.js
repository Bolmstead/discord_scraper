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
  getMint,
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
  process.env.HELIUS_RPC_URL || "https://your-helius-or-triton-endpoint.com"
);
const jupiterAPI = createJupiterApiClient();

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
  const quote = await jupiterAPI.quoteGet({
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
  const swapResponse = await jupiterAPI.swapPost({
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

async function executeSwap(
  walletName,
  buyOrSell,
  name = "????",
  outputMint,
  keywords = [],
  amountToBuy = 1,
  slippageBps = 2000,
  priorityFee = 0.05,
  inputMint = "So11111111111111111111111111111111111111112"
) {
  let wallet = null;
  console.log("🚀 ~ executeSwap ~ walletName:", walletName);
  console.log("🚀 ~ executeSwap ~ buyOrSell:", buyOrSell);
  console.log("🚀 ~ executeSwap ~ name:", name);
  console.log("🚀 ~ executeSwap ~ outputMint:", outputMint);
  console.log("🚀 ~ executeSwap ~ keywords:", keywords);
  console.log("🚀 ~ executeSwap ~ amountToBuy:", amountToBuy);
  console.log("🚀 ~ executeSwap ~ slippageBps:", slippageBps);
  console.log("🚀 ~ executeSwap ~ priorityFee:", priorityFee);
  console.log("🚀 ~ executeSwap ~ inputMint:", inputMint);

  if (buyOrSell !== "sell" && buyOrSell !== "buy") {
    console.error("Invalid buyOrSell value");
    return null;
  }

  // Early validation to prevent unnecessary processing
  if (!outputMint || !inputMint) {
    console.error("Missing required mint addresses");
    return null;
  }
  if (slippageBps > 10000) {
    console.error("Slippagebps too high");
    return null;
  }

  // Single log for trade parameters
  console.log("Trade Parameters:", {
    buyOrSell,
    name,
    outputMint,
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
  if (walletName === "me") {
    wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );

    console.log(
      "🚀 ~ wallet.publicKey.toString():",
      wallet.publicKey.toString()
    );
  } else if (walletName === "Sharif") {
    wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.SHARIF_WALLET_PRIVATE_KEY || "")
    );
    console.log(
      "🚀 ~ wallet.publicKey.toString():",
      wallet.publicKey.toString()
    );
  }

  // ####### REMOVE THIS #######
  if (DEFAULT_AMOUNT_TO_BUY) {
    amountToBuy = DEFAULT_AMOUNT_TO_BUY;
  }
  // ###########################

  const amountToBuyLamports = amountToBuy * LAMPORTS_PER_SOL;

  try {
    if (!wallet) {
      console.error("Wallet not found");
      return null;
    }
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

    // Just sign and send
    transaction.sign([wallet]);
    const signature = getSignature(transaction);
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

    console.log(
      `✅ Transaction successful: https://solscan.io/tx/${signature}`
    );
    return true;
  } catch (error) {
    console.error("Swap execution failed:", error);
    return null;
  }
}

async function getTokenBalance(tokenMint, walletName) {
  try {
    let wallet = null;
    if (walletName === "me") {
      wallet = Keypair.fromSecretKey(
        bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
      );
    } else if (walletName === "Sharif") {
      wallet = Keypair.fromSecretKey(
        bs58.decode(process.env.SHARIF_WALLET_PRIVATE_KEY || "")
      );
    }

    // Convert token mint string to PublicKey
    const mintPubkey = new PublicKey(tokenMint);

    // Get the associated token account address
    const tokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      wallet.publicKey
    );

    try {
      const account = await getAccount(connection, tokenAccount);

      // Get mint info to get decimals
      const mintInfo = await getMint(connection, mintPubkey);
      const decimals = mintInfo.decimals;

      return {
        success: true,
        balance: Number(account.amount),
        decimals: decimals,
        formattedBalance: Number(account.amount) / Math.pow(10, decimals),
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

async function sellTokenPercent(
  walletName,
  memeTokenAddress,
  percentToSell = 100,
  amountToSell
) {
  console.log("🚀 Starting sellTokenPercent function");
  console.log(`📝 Input token address: ${memeTokenAddress}`);
  console.log(`📊 Percentage to sell: ${percentToSell}%`);

  let wallet = null;
  if (walletName === "me") {
    wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );
  } else if (walletName === "Sharif") {
    wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.SHARIF_WALLET_PRIVATE_KEY || "")
    );
  }

  console.log(`👛 Using wallet: ${wallet.publicKey.toString()}`);

  // Convert the input token address to a PublicKey
  const memeTokenPublicKey = new PublicKey(memeTokenAddress);
  console.log(
    `🔑 Converted token address to PublicKey: ${memeTokenPublicKey.toString()}`
  );

  const solanaAddress = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );
  console.log(`💵 SOLANA token address: ${solanaAddress.toString()}`);

  try {
    console.log("🔍 Getting associated token account...");
    const userTokenAccount = await getAssociatedTokenAddress(
      memeTokenPublicKey,
      wallet.publicKey
    );
    console.log(`📂 Associated token account: ${userTokenAccount.toString()}`);

    console.log("💰 Checking token balance...");
    const tokenBalance = await connection.getTokenAccountBalance(
      userTokenAccount
    );
    let { amount, decimals, uiAmount } = tokenBalance.value;

    amount = Number(amount);

    if (!amountToSell) {
      console.log("🚀 ~ sellTokenPerce ~ tokenBalance:", tokenBalance);
      console.log(`📊 Raw token balance: ${JSON.stringify(amount)}`);
      console.log(`💎 UI Amount: ${uiAmount}`);

      if (!amount || amount <= 0) {
        console.error(`❌ No tokens found for ${memeTokenAddress}`);
        throw new Error(`No tokens found for ${memeTokenAddress}`);
      }

      // Calculate the amount to sell based on percentage
      amountToSell = (amount * percentToSell) / 100;
      console.log(
        `✅ Found ${amount} tokens, selling ${amountToSell} tokens (${percentToSell}%)`
      );
    }
    // Get quote using the API client
    console.log("🔍 Getting quote...");
    const quote = await getQuote(
      memeTokenPublicKey.toString(),
      solanaAddress.toString(),
      Math.floor(amountToSell), // Convert percentage to raw amount
      500
    );
    console.log("✅ Quote received:", quote);

    // Get swap response
    console.log("🔄 Getting swap response...");
    const swapResponse = await getSwapResponse(wallet, quote);
    console.log("✅ Swap response received");

    // Prepare and send transaction
    console.log("⚡ Preparing transaction...");
    const transactionBuffer = Buffer.from(
      swapResponse.swapTransaction,
      "base64"
    );
    const transaction = VersionedTransaction.deserialize(
      Uint8Array.from(transactionBuffer)
    );

    console.log("✍️ Signing and sending transaction...");
    transaction.sign([wallet]);
    const signature = getSignature(transaction);
    const serializedTx = transaction.serialize();

    const txResponse = await transactionSenderAndConfirmationWaiter({
      connection,
      serializedTransaction: Buffer.from(serializedTx),
      blockhashWithExpiryBlockHeight: {
        blockhash: transaction.message.recentBlockhash,
        lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      },
    });

    console.log("✅ Transaction executed successfully");
    console.log(`🔗 Transaction signature: ${signature}`);
    console.log(`💰 Sold ${amountToSell} tokens (${percentToSell}%)`);

    return {
      success: true,
      transactionSignature: signature,
      amountSold: amountToSell,
      receivedAmount: quote.outAmount / 10 ** 6,
    };
  } catch (error) {
    console.error("❌ Error selling tokens:", error);
    console.error("Stack trace:", error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

const sellPercentOfTokenToZero = async (
  walletName,
  memeTokenAddress,
  percentToSell,
  millisecondsToWaitBetweenTries = 15 * 1000
) => {
  try {
    let totalPercentSold = 0;
    let numberOfTries = 0;
    let amountToSell;
    console.log(
      `Starting sellPercentOfTokenToZero for ${walletName} with ${memeTokenAddress}`
    );
    while (totalPercentSold < 100 && numberOfTries < 10) {
      console.log(
        `💸 Trying to sell ${percentToSell}% of token, total sold: ${totalPercentSold}%`
      );
      console.log("🔄 Try #", numberOfTries);
      const { success, transactionSignature, amountSold } =
        await sellTokenPercent(
          walletName,
          memeTokenAddress,
          percentToSell,
          amountToSell
        );
      if (!success) {
        console.error("❌ Error selling tokens:", error);
      } else {
        totalPercentSold += percentToSell;
        numberOfTries++;
        amountToSell = amountSold;
        console.log(
          `✅ Successfully sold ${percentToSell}% of token for ${walletName}, total sold: ${totalPercentSold}%`
        );
        console.log(`✅ TX: https://solscan.io/tx/${transactionSignature}`);
        if (totalPercentSold < 100 && numberOfTries < 10) {
          console.log(
            `⏳ Waiting ${
              millisecondsToWaitBetweenTries / 1000
            } seconds before next try...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, millisecondsToWaitBetweenTries)
          );
          console.log("⌛️ Done waiting");
        }
      }
    }
    console.log(`🎉 Done Selling for ${walletName}! 🎉`);
    console.log(`🎉 Total percent sold: ${totalPercentSold}%`);
    console.log(`🎉 Total tries: ${numberOfTries}`);
    console.log(`🤑 🍾 🎉 💰 ✅ 💵 🏝️ 🥂`);
  } catch (error) {
    console.error("❌ Error selling tokens:", error);
  }
};

// Export the individual functions for use in other files
export {
  getQuote,
  getSwapResponse,
  executeSwap,
  getTokenBalance,
  connection,
  jupiterAPI,
  sellTokenPercent,
  sellPercentOfTokenToZero,
};
