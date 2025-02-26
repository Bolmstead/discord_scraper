import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { generateWallet } from "./generateWallet";
import { DEFAULT_DECIMALS, PumpFunSDK } from "pumpdotfun-sdk";
import {
  getOrCreateKeypair,
  getSPLBalance,
  printSOLBalance,
  printSPLBalance,
  createKeypair,
} from "./pumpdotfunUtil";
import assert from "node:assert";
// import { Scraper } from "@the-convocation/twitter-scraper";
import { generateTweetImage } from "./tweetToImage";

// Store the last processed tweet ID to avoid duplicates
let lastProcessedTweetId: string | undefined = undefined;

export const KEYS_FOLDER = __dirname + "/.keys";
export const SLIPPAGE_BASIS_POINTS = 100n;

// export const scraper = new Scraper();

export const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in .env file");
  }

  const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  const wallet = new NodeWallet(new Keypair());
  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

// Add type for SDK parameters
export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  filePath: string;
}

export interface PriceParams {
  unitLimit: number;
  unitPrice: number;
}
export interface TweetData {
  username: string;
  handle: string;
  text: string;
  avatar?: string;
  verified?: boolean;
  timestamp?: string;
}

export const createAndBuyToken = async (
  sdk: any,
  testAccount: any,
  mint: any,
  tokenMetadata: TokenMetadata,
  sell: boolean = true
) => {
  console.log("🚀 Starting createAndBuyToken function");
  console.log("📦 Token Metadata:", tokenMetadata);
  console.log("👀 sell? :", sell);

  const buyAmount = BigInt(0.0001 * LAMPORTS_PER_SOL);
  console.log("💰 Buy amount:", buyAmount.toString());

  const tokenMetadataFinal = {
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    description: tokenMetadata.description,
    file: await fs.openAsBlob(tokenMetadata.filePath),
  };
  console.log("📄 Final token metadata prepared:", {
    name: tokenMetadataFinal.name,
    symbol: tokenMetadataFinal.symbol,
    description: tokenMetadataFinal.description,
  });

  console.log("🎯 Attempting to create and buy token...");
  const createResults = await sdk.createAndBuy(
    testAccount,
    mint,
    tokenMetadataFinal,
    BigInt(0.01 * LAMPORTS_PER_SOL),
    100n
  );
  console.log("✨ Create and buy results:", createResults);

  if (createResults.success) {
    console.log("✅ Token creation successful!");
    console.log(
      "🔗 Token URL:",
      `https://pump.fun/${mint.publicKey.toBase58()}`
    );
    await printSPLBalance(
      sdk.connection,
      mint.publicKey,
      testAccount.publicKey
    );
    if (sell) {
      console.log("⏳ Waiting 10 seconds before selling tokens...");
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay
      console.log("⏰ Timeout complete, proceeding with sell...");
      await sellTokens(sdk, testAccount, mint);
    }
  } else {
    console.log("❌ Create and Buy failed");
  }
};

export const buyTokens = async (sdk: any, testAccount: any, mint: any) => {
  console.log("🛍️ Starting buyTokens function");
  console.log("🎯 Attempting to buy tokens...");

  // --------- Coin ---------

  // {
  //   ticker: "SWF",
  //   name: "Sovereign Wealth Fund",
  //   address: "FtBXDMyD4SvAa6keQPAGk4sgRVuUECsxGU1X2dLWpump",
  //   timeToSell: 90 * 1000,
  //   keywords: ["sovereign wealth fund"],
  //   amountToBuy: 1,
  //   slippage: 30,
  //   priorityFee: 0.05,
  // },

  // --------- Buy Function ---------
  // async buy(
  //   buyer: Keypair,
  //   mint: PublicKey,
  //   buyAmountSol: bigint,
  //   slippageBasisPoints: bigint = 500n,
  //   priorityFees?: PriorityFee,
  //   commitment: Commitment = DEFAULT_COMMITMENT,
  //   finality: Finality = DEFAULT_FINALITY
  // ): Promise<TransactionResult>

  //  Buys a specified amount of tokens.
  // - Parameters:
  //      buyer: The keypair of the buyer.
  //      mint: The public key of the mint account.
  //      buyAmountSol: Amount of SOL to buy.
  //      slippageBasisPoints: Slippage in basis points (default: 500).
  //      priorityFees: Priority fees (optional).
  //      commitment: Commitment level (default: DEFAULT_COMMITMENT).
  //      finality: Finality level (default: DEFAULT_FINALITY).

  const buyResults = await sdk.buy(
    testAccount,
    mint.publicKey,
    BigInt(0.00001 * LAMPORTS_PER_SOL),
    SLIPPAGE_BASIS_POINTS
  );

  if (buyResults.success) {
    console.log("✅ Token purchase successful!");
    await printSPLBalance(
      sdk.connection,
      mint.publicKey,
      testAccount.publicKey
    );
    const bondingCurve = await sdk.getBondingCurveAccount(mint.publicKey);
    console.log("📈 Bonding curve after buy:", bondingCurve);
  } else {
    console.log("❌ Buy failed");
  }
};

export const sellTokens = async (sdk: any, testAccount: any, mint: any) => {
  const currentSPLBalance = await getSPLBalance(
    sdk.connection,
    mint.publicKey,
    testAccount.publicKey
  );
  console.log("currentSPLBalance", currentSPLBalance);

  if (currentSPLBalance) {
    const sellResults = await sdk.sell(
      testAccount,
      mint.publicKey,
      BigInt(currentSPLBalance * Math.pow(10, DEFAULT_DECIMALS)),
      SLIPPAGE_BASIS_POINTS
    );

    if (sellResults.success) {
      await printSOLBalance(
        sdk.connection,
        testAccount.publicKey,
        "Test Account keypair"
      );
      printSPLBalance(
        sdk.connection,
        mint.publicKey,
        testAccount.publicKey,
        "After SPL sell all"
      );
      console.log(
        "Bonding curve after sell",
        await sdk.getBondingCurveAccount(mint.publicKey)
      );
    } else {
      console.log("Sell failed");
    }
  }
};

export const startCreatingToken = async (latestTweet: any) => {
  try {
    console.log("🎬 Starting token creation process");
    console.log("🐦 Tweet data:", latestTweet);

    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);
    const connection = provider.connection;

    console.log("📂 KEYS_FOLDER location:", KEYS_FOLDER);

    const testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
    console.log("👤 Test account created:", testAccount.publicKey.toString());

    const mint = createKeypair(KEYS_FOLDER, "mint");
    console.log("🎫 Mint account created:", mint.publicKey.toString());

    console.log("💰 Checking SOL balance...");
    await printSOLBalance(
      connection,
      testAccount.publicKey,
      "Test Account keypair"
    );

    console.log("🌐 Getting global account...");
    const globalAccount = await sdk.getGlobalAccount();
    console.log("🌍 Global account:", globalAccount);

    const currentSolBalance = await connection.getBalance(
      testAccount.publicKey
    );
    console.log("💳 Current SOL balance:", currentSolBalance);

    if (currentSolBalance === 0) {
      console.log("⚠️ No SOL balance found!");
      console.log("🏦 Please send SOL to:", testAccount.publicKey.toBase58());
      return;
    }

    const tweetData: TweetData = {
      username: latestTweet.name,
      handle: latestTweet.handle,
      text: latestTweet.text,
      verified: true,
      avatar:
        "https://pbs.twimg.com/profile_images/1892722746817236992/-pDs8pfw_400x400.jpg",
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    console.log("📝 Prepared tweet data:", tweetData);

    console.log("🎨 Generating tweet image...");
    await generateTweetImage(tweetData);
    console.log("🖼️ Tweet image generated!");

    const tokenMetadata: TokenMetadata = {
      name: latestTweet.text.substring(0, 10),
      symbol: latestTweet.text.substring(0, 10),
      description: latestTweet.text,
      filePath: "images/tweet.png",
    };
    console.log("📋 Token metadata prepared:", tokenMetadata);

    if (!fs.existsSync(tokenMetadata.filePath)) {
      console.log("❌ Image file not found at:", tokenMetadata.filePath);
      throw new Error(
        `Image file not found at path: ${tokenMetadata.filePath}`
      );
    }
    console.log("✅ Image file verified");

    console.log("🔍 Checking global account...");
    console.log(await sdk.getGlobalAccount());

    console.log("📊 Checking bonding curve account...");
    let bondingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
    console.log("📈 Initial bonding curve:", bondingCurveAccount);

    if (!bondingCurveAccount) {
      console.log("🆕 No bonding curve found, creating new token...");
      await createAndBuyToken(sdk, testAccount, mint, tokenMetadata);
      bondingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
      console.log("📈 New bonding curve created:", bondingCurveAccount);
    }

    if (bondingCurveAccount) {
      console.log("🔄 Executing token operations...");
      await buyTokens(sdk, testAccount, mint);
      // await sellTokens(sdk, testAccount, mint);
      await createAndBuyToken(sdk, testAccount, mint, tokenMetadata);
      console.log("✅ Token operations completed");
    }
  } catch (error) {
    console.error("❌ An error occurred:", error);
  }
};

// export const logInToTwitter = async () => {
//   await scraper.login(
//     process.env.TWITTER_USERNAME!,
//     process.env.TWITTER_PASSWORD!,
//     process.env.TWITTER_EMAIL!
//   );

//   let lastProcessedTweetId: string | undefined = undefined;

//   setInterval(async () => {
//     try {
//       const latestTweet = await scraper.getLatestTweet("brocTestBot");
//       console.log("🚀 ~ setInterval ~ latestTweet:", latestTweet);
//       if (!lastProcessedTweetId) {
//         lastProcessedTweetId = latestTweet?.id;
//         console.log("No Processed Tweet yet");
//         return;
//       }
//       if (!latestTweet) {
//         console.log("No tweet found");
//         return;
//       }
//       if (latestTweet?.id !== lastProcessedTweetId) {
//         lastProcessedTweetId = latestTweet?.id;
//         await startCreatingToken(latestTweet);
//       }
//     } catch (error) {
//       console.error("An error occurred:", error);
//     }
//   }, 10000);
// };

// Start the process
