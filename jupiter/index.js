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
import { sendTelegramMessage } from "../helpers/sendTelegramMessage.js";
import axios from "axios";

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

async function getQuote(
  inputMint,
  outputMint,
  amount,
  slippageBps,
  dynamicSlippage = false
) {
  console.log(
    "🚀 ~ getQuote ~ inputMint, outputMint, amount:",
    inputMint,
    outputMint,
    amount
  );
  let params = {
    inputMint,
    outputMint,
    amount,
  };
  if (dynamicSlippage) {
    params.dynamicSlippage = true;
  } else {
    params.slippageBps = slippageBps;
  }

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://lite-api.jup.ag/swap/v1/quote",
    headers: {
      Accept: "application/json",
    },
    params,
  };

  try {
    const response = await axios.request(config);
    const quote = response.data;
    console.log("🚀 ~ getQuote ~ quote:", quote);
    if (!quote) {
      throw new Error("unable to quote");
    }
    return quote;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getSwapResponse(wallet, quote) {
  try {
    console.log("GETSWAPRESPONSE");
    let data = JSON.stringify({
      userPublicKey: wallet.publicKey.toString(),
      quoteResponse: quote,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 10000000,
          priorityLevel: "veryHigh",
        },
      },
      dynamicComputeUnitLimit: true,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://lite-api.jup.ag/swap/v1/swap",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: data,
    };
    console.log("🚀 ~ getSwapResponse ~ config:", config);

    const response = await axios.request(config);
    console.log("Inside axios");
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error in getSwapResponse:", error);
    throw error;
  }
}

async function executeSwap(
  walletName,
  buyOrSell,
  name = "????",
  outputMint,
  isTest = false,
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

  if (isTest) {
    priorityFee = 0.001;
    slippageBps = 500;
  }
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
  // if (isTest) {
  //   amountToBuy = 0.001;
  //   priorityFee = 0.01;
  // }

  // Single log for trade parameters
  console.log("Trade Parameters:", {
    buyOrSell,
    name,
    outputMint,
    keywords,
    amountToBuy,
  });

  // Validate amount and adjust if needed
  if (amountToBuy < 0.000001) {
    console.log(`Skipping ${name}: amount is too low`);
    return null;
  }

  if (walletName === "Berkley" || walletName === "me") {
    wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );

    console.log(
      "🚀 ~ wallet.publicKey.toString():",
      wallet.publicKey.toString()
    );
  }

  const amountToBuyLamports = amountToBuy * LAMPORTS_PER_SOL;

  try {
    if (!wallet) {
      console.error("Wallet not found");
      return null;
    }
    // Get quote and prepare swap
    let quote;
    try {
      quote = await getQuote(
        inputMint,
        outputMint,
        amountToBuyLamports,
        slippageBps
      );
    } catch (error) {
      console.error("Error getting quote:", error);
      sendTelegramMessage(`Error in executeSwap (getQuote): ${error.message}`);
      return null;
    }

    if (!quote) {
      console.error("Failed to get quote");
      return null;
    }

    let swapResponse;
    try {
      swapResponse = await getSwapResponse(wallet, quote);
    } catch (error) {
      console.error("Error getting swap response:", error);
      sendTelegramMessage(
        `Error in executeSwap (getSwapResponse): ${error.message}`
      );
      sendTelegramMessage(`quote: ${JSON.stringify(quote)}`);
      return null;
    }
    if (!swapResponse) {
      console.error("Failed to get swap response");
      sendTelegramMessage(
        `Error in executeSwap (getSwapResponse): ${error.message}`
      );
      sendTelegramMessage(`quote: ${JSON.stringify(quote)}`);

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

    let txResponse;
    try {
      txResponse = await transactionSenderAndConfirmationWaiter({
        connection,
        serializedTransaction: Buffer.from(serializedTx),
        blockhashWithExpiryBlockHeight: {
          blockhash: transaction.message.recentBlockhash,
          lastValidBlockHeight: swapResponse.lastValidBlockHeight,
        },
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      sendTelegramMessage(
        `Error in executeSwap (transaction): ${error.message}`
      );
      try {
        sendTelegramMessage(`quote: ${JSON.stringify(quote)}`);
        sendTelegramMessage(`swapResponse: ${JSON.stringify(swapResponse)}`);
      } catch (error) {
        console.error("Error sending telegram message:", error);
      }

      return null;
    }

    // Check transaction result
    if (!txResponse) {
      console.error("Transaction not confirmed");
      sendTelegramMessage(
        `Error in executeSwap (transaction): ${error.message}`
      );
      try {
        sendTelegramMessage(`quote: ${JSON.stringify(quote)}`);
        sendTelegramMessage(`swapResponse: ${JSON.stringify(swapResponse)}`);
      } catch (error) {
        console.error("Error sending telegram message:", error);
      }

      return null;
    }

    if (txResponse.meta?.err) {
      console.error("Transaction error:", txResponse.meta.err);
      return null;
    }

    console.log(
      `✅ Transaction successful: https://solscan.io/tx/${signature}`
    );
    try {
      sendTelegramMessage(`quote: ${JSON.stringify(quote)}`);
      sendTelegramMessage(`swapResponse: ${JSON.stringify(swapResponse)}`);
    } catch (error) {
      console.error("Error sending telegram message:", error);
    }
    return true;
  } catch (error) {
    console.error("Swap execution failed:", error);
    sendTelegramMessage(`Error in executeSwap: ${error.message}`);
    return null;
  }
}

// async function getTokenBalance(tokenMint, walletName) {
//   try {
//     let wallet = null;
//     if (walletName === "Berkley") {
//       wallet = Keypair.fromSecretKey(
//         bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
//       );
//     } else if (walletName === "Sharif") {
//       wallet = Keypair.fromSecretKey(
//         bs58.decode(process.env.SHARIF_WALLET_PRIVATE_KEY || "")
//       );
//     }

//     // Convert token mint string to PublicKey
//     const mintPubkey = new PublicKey(tokenMint);

//     // Get the associated token account address
//     let tokenAccount;
//     try {
//       tokenAccount = await getAssociatedTokenAddress(
//         mintPubkey,
//         wallet.publicKey
//       );
//       console.log("🚀 ~ getTokenBalance ~ tokenAccount:", tokenAccount);
//     } catch (error) {
//       console.error("Error getting associated token address:", error);
//       sendTelegramMessage(
//         `Error getting associated token address: ${error.message}`
//       );
//       throw error;
//     }

//     try {
//       let account;
//       try {
//         account = await getAccount(connection, tokenAccount);
//       } catch (error) {
//         console.error("Error getting token account:", error);
//         sendTelegramMessage(`Error getting token account: ${error.message}`);
//         throw error;
//       }

//       // Get mint info to get decimals
//       let mintInfo, decimals;
//       try {
//         mintInfo = await getMint(connection, mintPubkey);
//         decimals = mintInfo.decimals;
//       } catch (error) {
//         console.error("Error getting mint info:", error);
//         sendTelegramMessage(`Error getting mint info: ${error.message}`);
//         throw error;
//       }

//       return {
//         success: true,
//         balance: Number(account.amount),
//         decimals: decimals,
//         formattedBalance: Number(account.amount) / Math.pow(10, decimals),
//       };
//     } catch (error) {
//       sendTelegramMessage(`Error in getTokenBalance: ${error.message}`);

//       if (error.message.includes("Account does not exist")) {
//         return {
//           success: true,
//           balance: 0,
//           decimals: 0,
//           formattedBalance: 0,
//         };
//       }
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error getting token balance:", error);
//     sendTelegramMessage(`Error in getTokenBalance: ${error.message}`);

//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// }

async function sellTokenPercent(
  walletName,
  memeTokenAddress,
  percentToSell = 100,
  amountToSell,
  slippageBps = 2000
) {
  console.log("🚀 Starting sellTokenPercent function");
  console.log(`📝 Input token address: ${memeTokenAddress}`);
  console.log(`📊 Percentage to sell: ${percentToSell}%`);

  let wallet = null;
  if (walletName === "Berkley") {
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
    let userTokenAccount;
    try {
      userTokenAccount = await getAssociatedTokenAddress(
        memeTokenPublicKey,
        wallet.publicKey
      );
      console.log(
        `📂 Associated token account: ${userTokenAccount.toString()}`
      );
    } catch (error) {
      console.error("Error getting associated token address:", error);
      sendTelegramMessage(
        `Error getting associated token address: ${error.message}`
      );
      throw error;
    }

    console.log("💰 Checking token balance...");
    let tokenBalance;
    try {
      tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
    } catch (error) {
      console.error("Error getting token balance:", error);
      sendTelegramMessage(`Error getting token balance: ${error.message}`);
      throw error;
    }
    let { amount, decimals, uiAmount } = tokenBalance.value;
    console.log("🕵 ~ sellTokenPercent ~ tokenBalance:", tokenBalance);
    console.log("🕵 ~ sellTokenPercent ~ amount:", amount);
    console.log("🕵 ~ sellTokenPercent ~ decimals:", decimals);
    console.log("🕵 ~ sellTokenPercent ~ uiAmount:", uiAmount);
    amount = Number(amount);
    console.log("🕵 ~ sellTokenPercent ~ amount:", amount);
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
    let quote;
    try {
      quote = await getQuote(
        memeTokenPublicKey.toString(),
        solanaAddress.toString(),
        Math.floor(amountToSell), // Convert percentage to raw amount
        slippageBps
      );
      console.log("✅ Quote received:", quote);
    } catch (error) {
      console.error("Error getting quote:", error);
      sendTelegramMessage(
        `Error in sellTokenPercent (getQuote): ${error.message}`
      );
      throw error;
    }

    // Get swap response
    console.log("🔄 Getting swap response...");
    let swapResponse;
    try {
      swapResponse = await getSwapResponse(wallet, quote);
      console.log("✅ Swap response received");
    } catch (error) {
      console.error("Error getting swap response:", error);
      sendTelegramMessage(
        `Error in sellTokenPercent (getSwapResponse): ${error.message}`
      );
      throw error;
    }

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
    sendTelegramMessage(`Error in sellTokenPercent: ${error.message}`);
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
  millisecondsToWaitBetweenTries = 10 * 1000,
  maxNumberOfTries = 10
) => {
  try {
    let totalPercentSold = 0;
    let numberOfTries = 0;
    let amountToSell;
    console.log(
      `Starting sellPercentOfTokenToZero for ${walletName} with ${memeTokenAddress}`
    );
    while (totalPercentSold < 100 && numberOfTries < maxNumberOfTries) {
      console.log(
        `💸 Trying to sell ${percentToSell}% of token, total sold: ${totalPercentSold}%`
      );
      console.log("🔄 Try #", numberOfTries);

      let success = false;
      let transactionSignature = null;
      let amountSold = null;

      // Try to sell with retries
      for (let attempt = 1; attempt <= maxNumberOfTries; attempt++) {
        try {
          console.log(`Sell attempt ${attempt} of ${maxNumberOfTries}`);

          const result = await sellTokenPercent(
            walletName,
            memeTokenAddress,
            percentToSell,
            amountToSell,
            undefined // Use default slippageBps
          );

          if (result && result.success) {
            success = result.success;
            transactionSignature = result.transactionSignature;
            amountSold = result.amountSold;
            console.log(`✅ Sell successful on attempt ${attempt}`);
            break; // Exit retry loop on success
          } else {
            console.error(`❌ Sell attempt ${attempt} failed`);
          }
        } catch (error) {
          console.error(`❌ Error on sell attempt ${attempt}:`, error);
          sendTelegramMessage(
            `Error in sellPercentOfTokenToZero: ${error.message}`
          );
        }

        // If we're not on the last attempt, wait before retrying
        if (attempt < maxNumberOfTries) {
          const waitTime = 2000;
          console.log(`⏳ Waiting  before next attempt...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      if (!success) {
        console.error(
          `❌ ${walletName} wallet: Failed to sell tokens after ${maxNumberOfTries} attempts`
        );
        // Continue with the main loop instead of breaking completely
        numberOfTries++;
      } else {
        totalPercentSold += percentToSell;
        numberOfTries++;
        amountToSell = amountSold;
        console.log(
          `✅ ${walletName} wallet: Successfully sold ${percentToSell}% of token, total sold: ${totalPercentSold}%`
        );
        console.log(`✅ TX: https://solscan.io/tx/${transactionSignature}`);

        if (totalPercentSold < 100 && numberOfTries < maxNumberOfTries) {
          console.log(
            `⏳ Waiting ${
              millisecondsToWaitBetweenTries / 1000
            } seconds before next batch sell for ${walletName} wallet...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, millisecondsToWaitBetweenTries)
          );
          console.log(`⌛️ Done waiting for ${walletName} wallet`);
        }
      }
    }

    console.log(`🎉 Done Selling for ${walletName}! 🎉`);
    console.log(`🎉 Total percent sold: ${totalPercentSold}%`);
    console.log(`🎉 Total tries: ${numberOfTries}`);
    console.log(`🤑 🍾 🎉 💰 ✅ 💵 🏝️ 🥂`);
    return { success: true, totalPercentSold };
  } catch (error) {
    console.error(`❌ Error selling tokens for ${walletName} wallet:`, error);
    sendTelegramMessage(`Error in sellPercentOfTokenToZero: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Swaps all tokens in the wallet to Solana (SOL)
 * @param {string} walletName - Name of the wallet ("Berkley" or "Sharif")
 * @param {number} slippageBps - Slippage in basis points (default: 2000 = 20%)
 * @param {number} minTokenBalance - Minimum token balance to consider for swapping (default: 0.000001)
 * @param {Array<string>} excludeTokens - Array of token mint addresses to exclude from swapping
 * @returns {Object} Result object with success status and details
 */
async function swapAllTokensToSolana(
  walletName = "Berkley",
  slippageBps = 20000,
  minTokenBalance = 0.01,
  excludeTokens = []
) {
  console.log("🚀 Starting swapAllTokensToSolana function");
  console.log(`👛 Wallet: ${walletName}`);
  console.log(
    `📊 Slippage: ${slippageBps} basis points (${slippageBps / 100}%)`
  );

  let wallet = Keypair.fromSecretKey(
    bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
  );

  if (!wallet) {
    console.error("❌ Wallet not found");
    return { success: false, error: "Wallet not found" };
  }

  console.log(`👛 Using wallet: ${wallet.publicKey.toString()}`);

  const solanaAddress = "So11111111111111111111111111111111111111112";
  const results = {
    success: true,
    totalSwapped: 0,
    successfulSwaps: [],
    failedSwaps: [],
    skippedTokens: [],
  };

  try {
    console.log("🔍 Getting all token accounts...");

    // Get all token accounts for the wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      wallet.publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log(`📊 Found ${tokenAccounts.value.length} token accounts`);

    if (tokenAccounts.value.length === 0) {
      console.log("ℹ️ No token accounts found");
      return { success: true, message: "No token accounts found", ...results };
    }

    // Process each token account
    for (const tokenAccount of tokenAccounts.value) {
      try {
        const accountInfo = tokenAccount.account;
        const tokenAccountPubkey = tokenAccount.pubkey;

        // Parse token account data
        const tokenAccountData = await connection.getTokenAccountBalance(
          tokenAccountPubkey
        );
        const { amount, decimals, uiAmount } = tokenAccountData.value;

        // Get mint address
        const mintAddress =
          accountInfo.data.parsed?.info?.mint ||
          new PublicKey(accountInfo.data.slice(0, 32)).toString();

        console.log(`\n🔍 Processing token: ${mintAddress}`);
        console.log(`💰 Balance: ${uiAmount} tokens`);

        // Skip if balance is too low
        if (!uiAmount || uiAmount < minTokenBalance) {
          console.log(`⏭️ Skipping token due to low balance: ${uiAmount}`);
          results.skippedTokens.push({
            mint: mintAddress,
            balance: uiAmount,
            reason: "Low balance",
          });
          continue;
        }

        // Skip if token is in exclude list
        if (excludeTokens.includes(mintAddress)) {
          console.log(`⏭️ Skipping excluded token: ${mintAddress}`);
          results.skippedTokens.push({
            mint: mintAddress,
            balance: uiAmount,
            reason: "Excluded",
          });
          continue;
        }

        // Skip if token is already SOL (wrapped SOL)
        if (mintAddress === solanaAddress) {
          console.log(`⏭️ Skipping SOL token: ${mintAddress}`);
          results.skippedTokens.push({
            mint: mintAddress,
            balance: uiAmount,
            reason: "Already SOL",
          });
          continue;
        }

        console.log(`🔄 Attempting to swap ${uiAmount} tokens to SOL...`);

        // Use the raw amount for the swap
        const rawAmount = Number(amount);

        try {
          // Get quote
          const quote = await getQuote(
            mintAddress,
            solanaAddress,
            rawAmount,
            slippageBps
          );

          if (!quote) {
            console.error(`❌ Failed to get quote for ${mintAddress}`);
            results.failedSwaps.push({
              mint: mintAddress,
              balance: uiAmount,
              error: "Failed to get quote",
            });
            continue;
          }

          // Get swap response
          const swapResponse = await getSwapResponse(wallet, quote);

          if (!swapResponse) {
            console.error(`❌ Failed to get swap response for ${mintAddress}`);
            results.failedSwaps.push({
              mint: mintAddress,
              balance: uiAmount,
              error: "Failed to get swap response",
            });
            continue;
          }

          // Execute transaction
          const transactionBuffer = Buffer.from(
            swapResponse.swapTransaction,
            "base64"
          );
          const transaction = VersionedTransaction.deserialize(
            Uint8Array.from(transactionBuffer)
          );

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

          if (!txResponse || txResponse.meta?.err) {
            console.error(`❌ Transaction failed for ${mintAddress}`);
            results.failedSwaps.push({
              mint: mintAddress,
              balance: uiAmount,
              error: txResponse?.meta?.err || "Transaction failed",
            });
            continue;
          }

          console.log(`✅ Successfully swapped ${uiAmount} tokens to SOL`);
          console.log(`🔗 Transaction: https://solscan.io/tx/${signature}`);

          results.successfulSwaps.push({
            mint: mintAddress,
            balance: uiAmount,
            signature: signature,
            receivedSol: quote.outAmount / LAMPORTS_PER_SOL,
          });

          results.totalSwapped += uiAmount;

          // Small delay between swaps to avoid overwhelming the network
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (swapError) {
          console.error(`❌ Error swapping ${mintAddress}:`, swapError);
          results.failedSwaps.push({
            mint: mintAddress,
            balance: uiAmount,
            error: swapError.message,
          });
        }
      } catch (error) {
        console.error(`❌ Error processing token account:`, error);
        results.failedSwaps.push({
          mint: "unknown",
          balance: 0,
          error: error.message,
        });
      }
    }

    // Summary
    console.log("\n🎉 Swap Summary:");
    console.log(`✅ Successful swaps: ${results.successfulSwaps.length}`);
    console.log(`❌ Failed swaps: ${results.failedSwaps.length}`);
    console.log(`⏭️ Skipped tokens: ${results.skippedTokens.length}`);
    console.log(`💰 Total tokens swapped: ${results.totalSwapped}`);

    if (results.failedSwaps.length > 0) {
      results.success = false;
      console.log("\n❌ Failed swaps details:");
      results.failedSwaps.forEach((swap) => {
        console.log(`  - ${swap.mint}: ${swap.error}`);
      });
    }

    // Send telegram notification
    if (results.successfulSwaps.length > 0) {
      const message = `🎉 Wallet cleanup complete for ${walletName}!\n✅ Swapped ${
        results.successfulSwaps.length
      } tokens to SOL\n💰 Total received: ${results.successfulSwaps
        .reduce((sum, swap) => sum + swap.receivedSol, 0)
        .toFixed(6)} SOL`;
      await sendTelegramMessage(message);
    }

    return results;
  } catch (error) {
    console.error("❌ Error in swapAllTokensToSolana:", error);
    await sendTelegramMessage(
      `Error in swapAllTokensToSolana: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

// Test function for getQuote
async function testGetQuote() {
  try {
    console.log("🧪 Testing getQuote function...");

    // Test parameters
    const inputMint = "So11111111111111111111111111111111111111112"; // SOL
    const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
    const amount = 1000000000; // 1 SOL in lamports
    const slippageBps = 50; // 0.5% slippage

    console.log("📝 Test parameters:");
    console.log(`  Input Token (SOL): ${inputMint}`);
    console.log(`  Output Token (USDC): ${outputMint}`);
    console.log(`  Amount: ${amount} lamports (${amount / 1000000000} SOL)`);
    console.log(
      `  Slippage: ${slippageBps} basis points (${slippageBps / 100}%)`
    );

    const quote = await getQuote(inputMint, outputMint, amount, slippageBps);

    console.log("✅ Quote received successfully!");
    console.log("📊 Quote details:");
    console.log(`  Input Amount: ${quote.inAmount}`);
    console.log(`  Output Amount: ${quote.outAmount}`);
    console.log(`  Price Impact: ${quote.priceImpactPct}%`);
    console.log(`  Route Plan: ${quote.routePlan?.length || 0} steps`);

    return quote;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

// Export the individual functions for use in other files
export {
  getQuote,
  getSwapResponse,
  executeSwap,
  connection,
  jupiterAPI,
  sellTokenPercent,
  sellPercentOfTokenToZero,
  swapAllTokensToSolana,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🚀 Running getTokenBalance test...");
  getQuote(
    "So11111111111111111111111111111111111111112",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    10000,
    50
  ).then((quote) => {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.TEST_WALLET_PRIVATE_KEY || "")
    );
    console.log("🚀 ~ getQuote ~ quote:", wallet.publicKey.toString());
    getSwapResponse(wallet, quote)
      .then((swapResponse) => {
        console.log("🚀 ~ getQuote ~ swapResponse:", swapResponse);
        console.log("✅ Test completed successfully!");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
      });
  });
}
