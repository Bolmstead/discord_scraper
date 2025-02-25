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
} from "./pumpdotfunUtil";
import assert from "node:assert";
import { Scraper } from "@the-convocation/twitter-scraper";
import { generateTweetImage } from "./tweetToImage";

// Store the last processed tweet ID to avoid duplicates
let lastProcessedTweetId: string | undefined = undefined;

const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = 100n;

const scraper = new Scraper();

const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in .env file");
  }

  const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  const wallet = new NodeWallet(new Keypair());
  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

// Add type for SDK parameters
interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  filePath: string;
}

interface PriceParams {
  unitLimit: number;
  unitPrice: number;
}
interface TweetData {
  username: string;
  handle: string;
  text: string;
  avatar?: string;
  verified?: boolean;
  timestamp?: string;
}

const createAndBuyToken = async (
  sdk: any,
  testAccount: any,
  mint: any,
  tokenMetadata: TokenMetadata
) => {
  const buyAmount = BigInt(0.0001 * LAMPORTS_PER_SOL);
  const priorityFee = {
    unitLimit: 250000,
    unitPrice: 250000,
  };
  // --------------------------
  // createAndBuy Parameters explanation:
  // --------------------------
  // async createAndBuy(
  //   creator: Keypair,
  //   mint: Keypair,
  //   createTokenMetadata: CreateTokenMetadata,
  //   buyAmountSol: bigint,
  //   slippageBasisPoints: bigint = 500n,
  //   priorityFees?: PriorityFee,
  //   commitment: Commitment = DEFAULT_COMMITMENT,
  //   finality: Finality = DEFAULT_FINALITY
  // ): Promise<TransactionResult>
  // --------------------------
  const tokenMetadatanFinal = {
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    description: tokenMetadata.description,
    file: await fs.openAsBlob(tokenMetadata.filePath),
  };
  const createResults = await sdk.createAndBuy(
    testAccount,
    mint,
    tokenMetadatanFinal,
    0,
    SLIPPAGE_BASIS_POINTS
  );
  console.log("🚀 ~ createResults:", createResults);

  if (createResults.success) {
    console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
    printSPLBalance(sdk.connection, mint.publicKey, testAccount.publicKey);
  } else {
    console.log("Create and Buy failed");
  }
};

const buyTokens = async (sdk: any, testAccount: any, mint: any) => {
  const buyResults = await sdk.buy(
    testAccount,
    mint.publicKey,
    BigInt(0.0001 * LAMPORTS_PER_SOL),
    SLIPPAGE_BASIS_POINTS,
    {
      unitLimit: 250000,
      unitPrice: 250000,
    }
  );

  if (buyResults.success) {
    printSPLBalance(sdk.connection, mint.publicKey, testAccount.publicKey);
    console.log(
      "Bonding curve after buy",
      await sdk.getBondingCurveAccount(mint.publicKey)
    );
  } else {
    console.log("Buy failed");
  }
};

const sellTokens = async (sdk: any, testAccount: any, mint: any) => {
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
      SLIPPAGE_BASIS_POINTS,
      {
        unitLimit: 250000,
        unitPrice: 250000,
      }
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

const startCreatingToken = async (latestTweet: any) => {
  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);
    const connection = provider.connection;

    console.log("KEYS_FOLDER:: ", KEYS_FOLDER);

    const testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
    console.log("🚀 ~ startCreatingToken ~ testAccount:", testAccount);
    const mint = getOrCreateKeypair(KEYS_FOLDER, "mint");
    console.log("🚀 ~ startCreatingToken ~ mint:", mint);

    await printSOLBalance(
      connection,
      testAccount.publicKey,
      "Test Account keypair"
    );

    const globalAccount = await sdk.getGlobalAccount();
    console.log(globalAccount);

    const currentSolBalance = await connection.getBalance(
      testAccount.publicKey
    );
    if (currentSolBalance === 0) {
      console.log(
        "Please send some SOL to the test-account:",
        testAccount.publicKey.toBase58()
      );
      return;
    }

    const tweetData: TweetData = {
      username: latestTweet.name,
      handle: latestTweet.username,
      text: latestTweet.text,
      verified: true,
      avatar:
        "https://pbs.twimg.com/profile_images/1892722746817236992/-pDs8pfw_400x400.jpg",
      timestamp: new Date(latestTweet.timeParsed).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    console.log("🚀 ~ startCreatingToken ~ tweetData:", tweetData);
    await generateTweetImage(tweetData);

    console.log("completed!!");

    const tokenMetadata: TokenMetadata = {
      name: latestTweet.text,
      symbol: "test",
      description: latestTweet.permanentUrl,
      filePath: "src/images/tweet.png",
    };

    // First verify the image exists
    if (!fs.existsSync(tokenMetadata.filePath)) {
      throw new Error(
        `Image file not found at path: ${tokenMetadata.filePath}`
      );
    }

    await createAndBuyToken(sdk, testAccount, mint, tokenMetadata);
    const bondingCurveAccount = await sdk.getBondingCurveAccount(
      mint.publicKey
    );
    console.log(
      "🚀 ~ startCreatingToken ~ bondingCurveAccount:",
      bondingCurveAccount
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const logInToTwitter = async () => {
  await scraper.login(
    process.env.TWITTER_USERNAME!,
    process.env.TWITTER_PASSWORD!,
    process.env.TWITTER_EMAIL!
  );

  let lastProcessedTweetId: string | undefined = undefined;

  setInterval(async () => {
    try {
      const latestTweet = await scraper.getLatestTweet("brocTestBot");
      console.log("🚀 ~ setInterval ~ latestTweet:", latestTweet);
      if (!lastProcessedTweetId) {
        lastProcessedTweetId = latestTweet?.id;
        console.log("No Processed Tweet yet");
        return;
      }
      if (!latestTweet) {
        console.log("No tweet found");
        return;
      }
      if (latestTweet?.id !== lastProcessedTweetId) {
        lastProcessedTweetId = latestTweet?.id;
        await startCreatingToken(latestTweet);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, 10000);
};

logInToTwitter();
