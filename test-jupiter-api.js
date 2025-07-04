import "dotenv/config";
import { createJupiterApiClient } from "@jup-ag/api";

// Common token addresses for testing
const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  TRUMP: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", // From your constants
  PNUT: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", // From your constants
};

// Base URLs for Jupiter API (using free tier endpoints)
const BASE_URLS = {
  SWAP: "https://lite-api.jup.ag/swap/v1",
  PRICE: "https://lite-api.jup.ag/price/v3",
  TOKENS: "https://lite-api.jup.ag/tokens/v2",
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

async function testGetQuote() {
  console.log("\n🔍 Testing Jupiter Quote API...");

  try {
    // Test 1: Get quote for SOL to USDC using direct HTTP request
    const quoteUrl = `${BASE_URLS.SWAP}/quote?inputMint=${TOKENS.SOL}&outputMint=${TOKENS.USDC}&amount=100000000&slippageBps=50`;

    const quoteResponse = await makeRequest(quoteUrl);

    console.log("✅ Quote Response:", {
      inputAmount: quoteResponse.inputAmount,
      outputAmount: quoteResponse.outputAmount,
      otherAmountThreshold: quoteResponse.otherAmountThreshold,
      swapMode: quoteResponse.swapMode,
      slippageBps: quoteResponse.slippageBps,
      priceImpactPct: quoteResponse.priceImpactPct,
      routePlan: quoteResponse.routePlan?.length || 0,
    });

    return quoteResponse;
  } catch (error) {
    console.error("❌ Error getting quote:", error.message);
    return null;
  }
}

async function testGetPrice() {
  console.log("\n💰 Testing Jupiter Price API...");

  try {
    // Test price for multiple tokens using direct HTTP request
    const priceUrl = `${BASE_URLS.PRICE}?mints=${[
      TOKENS.SOL,
      TOKENS.USDC,
      TOKENS.TRUMP,
    ].join(",")}`;

    const priceResponse = await makeRequest(priceUrl);

    console.log("✅ Price Response:", priceResponse);

    // Display prices in a readable format
    if (priceResponse.data) {
      Object.entries(priceResponse.data).forEach(([mint, priceData]) => {
        const tokenName =
          Object.keys(TOKENS).find((key) => TOKENS[key] === mint) || mint;
        console.log(`${tokenName}: $${priceData.price || "N/A"}`);
      });
    }

    return priceResponse;
  } catch (error) {
    console.error("❌ Error getting price:", error.message);
    return null;
  }
}

async function testGetTokens() {
  console.log("\n🪙 Testing Jupiter Tokens API...");

  try {
    // Get tokens with trading data
    const tokensUrl = `${BASE_URLS.TOKENS}/mints/tradable`;

    const tokensResponse = await makeRequest(tokensUrl);

    console.log(`✅ Found ${tokensResponse.length} tradable tokens`);

    // Show first 5 tokens as example
    console.log("First 5 tokens:");
    tokensResponse.slice(0, 5).forEach((token, index) => {
      console.log(
        `${index + 1}. ${token.name || "Unknown"} (${
          token.symbol || "N/A"
        }) - ${token.address}`
      );
    });

    // Find specific tokens we care about
    const ourTokens = tokensResponse.filter((token) =>
      Object.values(TOKENS).includes(token.address)
    );

    console.log("\nOur tracked tokens:");
    ourTokens.forEach((token) => {
      console.log(
        `- ${token.name || "Unknown"} (${token.symbol || "N/A"}): ${
          token.address
        }`
      );
    });

    return tokensResponse;
  } catch (error) {
    console.error("❌ Error getting tokens:", error.message);
    return null;
  }
}

async function testGetTokenInfo() {
  console.log("\n📊 Testing Individual Token Info...");

  try {
    // Get info for TRUMP token
    const tokenUrl = `${BASE_URLS.TOKENS}/token/${TOKENS.TRUMP}`;

    const tokenResponse = await makeRequest(tokenUrl);

    console.log("✅ TRUMP Token Info:", {
      name: tokenResponse.name,
      symbol: tokenResponse.symbol,
      decimals: tokenResponse.decimals,
      logoURI: tokenResponse.logoURI,
      tags: tokenResponse.tags,
    });

    return tokenResponse;
  } catch (error) {
    console.error("❌ Error getting token info:", error.message);
    return null;
  }
}

async function testSwapQuoteWithRoute() {
  console.log("\n🔄 Testing Complex Swap Route...");

  try {
    // Test a more complex swap - SOL to TRUMP token
    const quoteUrl = `${BASE_URLS.SWAP}/quote?inputMint=${TOKENS.SOL}&outputMint=${TOKENS.TRUMP}&amount=1000000000&slippageBps=500&onlyDirectRoutes=false`;

    const quoteResponse = await makeRequest(quoteUrl);

    console.log("✅ Complex Route Quote:", {
      inputAmount: quoteResponse.inputAmount,
      outputAmount: quoteResponse.outputAmount,
      priceImpactPct: quoteResponse.priceImpactPct,
      routePlan: quoteResponse.routePlan?.map((route) => ({
        swapInfo: route.swapInfo,
        percent: route.percent,
      })),
    });

    return quoteResponse;
  } catch (error) {
    console.error("❌ Error getting complex route:", error.message);
    return null;
  }
}

async function testSwapInstructions(quoteResponse) {
  console.log("\n📋 Testing Swap Instructions...");

  if (!quoteResponse) {
    console.log("❌ No quote response available for swap instructions");
    return null;
  }

  try {
    // Test getting swap instructions
    const swapUrl = `${BASE_URLS.SWAP}/swap-instructions`;

    const swapRequest = {
      quoteResponse,
      userPublicKey: "11111111111111111111111111111111", // Dummy public key for testing
      wrapAndUnwrapSol: true,
      useSharedAccounts: true,
      computeUnitPriceMicroLamports: 1000,
    };

    const swapResponse = await makeRequest(swapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapRequest),
    });

    console.log("✅ Swap Instructions received:", {
      instructionsLength: swapResponse.setupInstructions?.length || 0,
      swapInstruction: swapResponse.swapInstruction ? "Present" : "Missing",
      cleanupInstructions: swapResponse.cleanupInstructions?.length || 0,
    });

    return swapResponse;
  } catch (error) {
    console.error("❌ Error getting swap instructions:", error.message);
    return null;
  }
}

async function testWithJupiterClient() {
  console.log("\n🧪 Testing with Jupiter API Client...");

  try {
    // Initialize Jupiter API client
    const jupiterQuoteApi = createJupiterApiClient();

    // Test quote using the client
    const quoteResponse = await jupiterQuoteApi.quoteGet({
      inputMint: TOKENS.SOL,
      outputMint: TOKENS.USDC,
      amount: 100000000,
      slippageBps: 50,
    });

    console.log("✅ Client Quote Response:", {
      inputAmount: quoteResponse.inputAmount,
      outputAmount: quoteResponse.outputAmount,
      priceImpactPct: quoteResponse.priceImpactPct,
    });

    return quoteResponse;
  } catch (error) {
    console.error("❌ Error with Jupiter client:", error.message);
    return null;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Jupiter API Tests...");
  console.log("ℹ️  Using Jupiter API free tier endpoints (lite-api.jup.ag)");

  try {
    // Test 1: Basic quote using HTTP requests
    const quote = await testGetQuote();

    // Test 2: Price API using HTTP requests
    await testGetPrice();

    // Test 3: Tokens API using HTTP requests
    await testGetTokens();

    // Test 4: Individual token info
    await testGetTokenInfo();

    // Test 5: Complex routing
    const complexQuote = await testSwapQuoteWithRoute();

    // Test 6: Swap instructions (will likely fail with dummy data)
    await testSwapInstructions(quote);

    // Test 7: Try Jupiter client (might still fail)
    await testWithJupiterClient();

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export {
  testGetQuote,
  testGetPrice,
  testGetTokens,
  testGetTokenInfo,
  testSwapQuoteWithRoute,
  testSwapInstructions,
  testWithJupiterClient,
  runAllTests,
};
