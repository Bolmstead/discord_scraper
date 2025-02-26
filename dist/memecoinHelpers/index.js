"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCreatingToken = exports.sellTokens = exports.buyTokens = exports.createAndBuyToken = exports.getProvider = exports.SLIPPAGE_BASIS_POINTS = exports.KEYS_FOLDER = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const nodewallet_1 = __importDefault(require("@coral-xyz/anchor/dist/cjs/nodewallet"));
const anchor_1 = require("@coral-xyz/anchor");
const pumpdotfun_sdk_1 = require("pumpdotfun-sdk");
const pumpdotfunUtil_1 = require("./pumpdotfunUtil");
// import { Scraper } from "@the-convocation/twitter-scraper";
const tweetToImage_1 = require("./tweetToImage");
// Store the last processed tweet ID to avoid duplicates
let lastProcessedTweetId = undefined;
exports.KEYS_FOLDER = __dirname + "/.keys";
exports.SLIPPAGE_BASIS_POINTS = 100n;
// export const scraper = new Scraper();
const getProvider = () => {
    if (!process.env.HELIUS_RPC_URL) {
        throw new Error("Please set HELIUS_RPC_URL in .env file");
    }
    const connection = new web3_js_1.Connection(process.env.HELIUS_RPC_URL || "");
    const wallet = new nodewallet_1.default(new web3_js_1.Keypair());
    return new anchor_1.AnchorProvider(connection, wallet, { commitment: "finalized" });
};
exports.getProvider = getProvider;
const createAndBuyToken = async (sdk, testAccount, mint, tokenMetadata, sell = true) => {
    console.log("🚀 Starting createAndBuyToken function");
    console.log("📦 Token Metadata:", tokenMetadata);
    console.log("👀 sell? :", sell);
    const buyAmount = BigInt(0.0001 * web3_js_1.LAMPORTS_PER_SOL);
    console.log("💰 Buy amount:", buyAmount.toString());
    const tokenMetadataFinal = {
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        file: await fs_1.default.openAsBlob(tokenMetadata.filePath),
    };
    console.log("📄 Final token metadata prepared:", {
        name: tokenMetadataFinal.name,
        symbol: tokenMetadataFinal.symbol,
        description: tokenMetadataFinal.description,
    });
    console.log("🎯 Attempting to create and buy token...");
    const createResults = await sdk.createAndBuy(testAccount, mint, tokenMetadataFinal, BigInt(0.01 * web3_js_1.LAMPORTS_PER_SOL), 100n);
    console.log("✨ Create and buy results:", createResults);
    if (createResults.success) {
        console.log("✅ Token creation successful!");
        console.log("🔗 Token URL:", `https://pump.fun/${mint.publicKey.toBase58()}`);
        await (0, pumpdotfunUtil_1.printSPLBalance)(sdk.connection, mint.publicKey, testAccount.publicKey);
        if (sell) {
            console.log("⏳ Waiting 10 seconds before selling tokens...");
            await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay
            console.log("⏰ Timeout complete, proceeding with sell...");
            await (0, exports.sellTokens)(sdk, testAccount, mint);
        }
    }
    else {
        console.log("❌ Create and Buy failed");
    }
};
exports.createAndBuyToken = createAndBuyToken;
const buyTokens = async (sdk, testAccount, mint) => {
    console.log("🛍️ Starting buyTokens function");
    console.log("🎯 Attempting to buy tokens...");
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
    const buyResults = await sdk.buy(testAccount, mint.publicKey, BigInt(0.00001 * web3_js_1.LAMPORTS_PER_SOL), exports.SLIPPAGE_BASIS_POINTS);
    if (buyResults.success) {
        console.log("✅ Token purchase successful!");
        await (0, pumpdotfunUtil_1.printSPLBalance)(sdk.connection, mint.publicKey, testAccount.publicKey);
        const bondingCurve = await sdk.getBondingCurveAccount(mint.publicKey);
        console.log("📈 Bonding curve after buy:", bondingCurve);
    }
    else {
        console.log("❌ Buy failed");
    }
};
exports.buyTokens = buyTokens;
const sellTokens = async (sdk, testAccount, mint) => {
    const currentSPLBalance = await (0, pumpdotfunUtil_1.getSPLBalance)(sdk.connection, mint.publicKey, testAccount.publicKey);
    console.log("currentSPLBalance", currentSPLBalance);
    if (currentSPLBalance) {
        const sellResults = await sdk.sell(testAccount, mint.publicKey, BigInt(currentSPLBalance * Math.pow(10, pumpdotfun_sdk_1.DEFAULT_DECIMALS)), exports.SLIPPAGE_BASIS_POINTS);
        if (sellResults.success) {
            await (0, pumpdotfunUtil_1.printSOLBalance)(sdk.connection, testAccount.publicKey, "Test Account keypair");
            (0, pumpdotfunUtil_1.printSPLBalance)(sdk.connection, mint.publicKey, testAccount.publicKey, "After SPL sell all");
            console.log("Bonding curve after sell", await sdk.getBondingCurveAccount(mint.publicKey));
        }
        else {
            console.log("Sell failed");
        }
    }
};
exports.sellTokens = sellTokens;
const startCreatingToken = async (latestTweet) => {
    try {
        console.log("🎬 Starting token creation process");
        console.log("🐦 Tweet data:", latestTweet);
        const provider = (0, exports.getProvider)();
        const sdk = new pumpdotfun_sdk_1.PumpFunSDK(provider);
        const connection = provider.connection;
        console.log("📂 KEYS_FOLDER location:", exports.KEYS_FOLDER);
        const testAccount = (0, pumpdotfunUtil_1.getOrCreateKeypair)(exports.KEYS_FOLDER, "test-account");
        console.log("👤 Test account created:", testAccount.publicKey.toString());
        const mint = (0, pumpdotfunUtil_1.createKeypair)(exports.KEYS_FOLDER, "mint");
        console.log("🎫 Mint account created:", mint.publicKey.toString());
        console.log("💰 Checking SOL balance...");
        await (0, pumpdotfunUtil_1.printSOLBalance)(connection, testAccount.publicKey, "Test Account keypair");
        console.log("🌐 Getting global account...");
        const globalAccount = await sdk.getGlobalAccount();
        console.log("🌍 Global account:", globalAccount);
        const currentSolBalance = await connection.getBalance(testAccount.publicKey);
        console.log("💳 Current SOL balance:", currentSolBalance);
        if (currentSolBalance === 0) {
            console.log("⚠️ No SOL balance found!");
            console.log("🏦 Please send SOL to:", testAccount.publicKey.toBase58());
            return;
        }
        const tweetData = {
            username: latestTweet.name,
            handle: latestTweet.handle,
            text: latestTweet.text,
            verified: true,
            avatar: "https://pbs.twimg.com/profile_images/1892722746817236992/-pDs8pfw_400x400.jpg",
            timestamp: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        };
        console.log("📝 Prepared tweet data:", tweetData);
        console.log("🎨 Generating tweet image...");
        await (0, tweetToImage_1.generateTweetImage)(tweetData);
        console.log("🖼️ Tweet image generated!");
        const tokenMetadata = {
            name: latestTweet.text.substring(0, 10),
            symbol: latestTweet.text.substring(0, 10),
            description: latestTweet.text,
            filePath: "images/tweet.png",
        };
        console.log("📋 Token metadata prepared:", tokenMetadata);
        if (!fs_1.default.existsSync(tokenMetadata.filePath)) {
            console.log("❌ Image file not found at:", tokenMetadata.filePath);
            throw new Error(`Image file not found at path: ${tokenMetadata.filePath}`);
        }
        console.log("✅ Image file verified");
        console.log("🔍 Checking global account...");
        console.log(await sdk.getGlobalAccount());
        console.log("📊 Checking bonding curve account...");
        let bondingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
        console.log("📈 Initial bonding curve:", bondingCurveAccount);
        if (!bondingCurveAccount) {
            console.log("🆕 No bonding curve found, creating new token...");
            await (0, exports.createAndBuyToken)(sdk, testAccount, mint, tokenMetadata);
            bondingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
            console.log("📈 New bonding curve created:", bondingCurveAccount);
        }
        if (bondingCurveAccount) {
            console.log("🔄 Executing token operations...");
            await (0, exports.buyTokens)(sdk, testAccount, mint);
            // await sellTokens(sdk, testAccount, mint);
            await (0, exports.createAndBuyToken)(sdk, testAccount, mint, tokenMetadata);
            console.log("✅ Token operations completed");
        }
    }
    catch (error) {
        console.error("❌ An error occurred:", error);
    }
};
exports.startCreatingToken = startCreatingToken;
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
console.log("🚀 Starting application with test tweet...");
(0, exports.startCreatingToken)({
    name: "Elon Musk",
    handle: "elonmusk",
    text: "Hello, world!",
});
//# sourceMappingURL=index.js.map