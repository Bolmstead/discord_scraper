import "dotenv/config";
import { createJupiterApiClient } from "@jup-ag/api";

// Test with API key (if you have one)
async function testWithApiKey() {
  console.log("🔑 Testing Jupiter API Client with API Key...");

  try {
    // You can get an API key from https://portal.jup.ag/
    const apiKey = process.env.JUPITER_API_KEY; // Add this to your .env file

    if (!apiKey) {
      console.log("⚠️  No API key found in environment variables");
      console.log(
        "💡 Get one from https://portal.jup.ag/ and add JUPITER_API_KEY=your_key to .env"
      );
      return null;
    }

    // Try different ways to configure the client
    const configs = [
      { apiKey }, // Direct API key
      { headers: { Authorization: `Bearer ${apiKey}` } }, // Bearer token
      { headers: { "X-API-Key": apiKey } }, // X-API-Key header
    ];

    for (const [index, config] of configs.entries()) {
      console.log(`\n📡 Trying configuration ${index + 1}...`);

      try {
        const client = createJupiterApiClient(config);

        const quote = await client.quoteGet({
          inputMint: "So11111111111111111111111111111111111111112", // SOL
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          amount: 100000000,
          slippageBps: 50,
        });

        console.log("✅ Success with configuration", index + 1);
        console.log("Quote:", {
          inputAmount: quote.inputAmount,
          outputAmount: quote.outputAmount,
          priceImpactPct: quote.priceImpactPct,
        });

        return client;
      } catch (error) {
        console.log(`❌ Configuration ${index + 1} failed:`, error.message);
      }
    }

    console.log("❌ All configurations failed");
    return null;
  } catch (error) {
    console.error("❌ Error testing with API key:", error);
    return null;
  }
}

// Test without API key to see current behavior
async function testWithoutApiKey() {
  console.log("\n🔓 Testing Jupiter API Client without API Key...");

  try {
    const client = createJupiterApiClient();

    const quote = await client.quoteGet({
      inputMint: "So11111111111111111111111111111111111111112", // SOL
      outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      amount: 100000000,
      slippageBps: 50,
    });

    console.log("✅ Client works without API key!");
    console.log("Quote:", {
      inputAmount: quote.inputAmount,
      outputAmount: quote.outputAmount,
      priceImpactPct: quote.priceImpactPct,
    });

    return client;
  } catch (error) {
    console.error("❌ Client doesn't work without API key:", error.message);
    return null;
  }
}

// Test different base URLs
async function testWithCustomBaseUrl() {
  console.log("\n🌐 Testing with custom base URLs...");

  const baseUrls = [
    "https://lite-api.jup.ag", // Free tier
    "https://api.jup.ag", // Paid tier
  ];

  for (const baseUrl of baseUrls) {
    console.log(`\n📡 Trying ${baseUrl}...`);

    try {
      const client = createJupiterApiClient({ baseUrl });

      const quote = await client.quoteGet({
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amount: 100000000,
        slippageBps: 50,
      });

      console.log(`✅ Success with ${baseUrl}`);
      console.log("Quote:", {
        inputAmount: quote.inputAmount,
        outputAmount: quote.outputAmount,
      });

      return client;
    } catch (error) {
      console.log(`❌ ${baseUrl} failed:`, error.message);
    }
  }

  return null;
}

async function runClientTests() {
  console.log("🧪 Testing Jupiter API Client Compatibility...");

  // Test 1: Without API key
  await testWithoutApiKey();

  // Test 2: With API key (if available)
  await testWithApiKey();

  // Test 3: With custom base URLs
  await testWithCustomBaseUrl();

  console.log("\n📝 Summary:");
  console.log("- If all tests fail, the library might be outdated");
  console.log(
    "- Consider using direct HTTP requests (as in test-jupiter-api.js)"
  );
  console.log("- Check for library updates: npm update @jup-ag/api");
  console.log("- Get API key from: https://portal.jup.ag/");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runClientTests();
}

export {
  testWithApiKey,
  testWithoutApiKey,
  testWithCustomBaseUrl,
  runClientTests,
};
