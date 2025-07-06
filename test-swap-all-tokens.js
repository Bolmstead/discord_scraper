import "dotenv/config";
import { swapAllTokensToSolana } from "./jupiter/index.js";

/**
 * Test script for swapAllTokensToSolana function
 * This will swap all tokens in the specified wallet to SOL
 */

async function testSwapAllTokens() {
  console.log("🚀 Starting test for swapAllTokensToSolana...");

  // Configuration
  const walletName = "Berkley"; // Change to "Sharif" if needed
  const slippageBps = 2000; // 20% slippage - adjust as needed
  const minTokenBalance = 0.000001; // Minimum balance to consider
  const excludeTokens = [
    // Add any token mint addresses you want to exclude from swapping
    // Example: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  ];

  try {
    console.log(`📋 Configuration:`);
    console.log(`  Wallet: ${walletName}`);
    console.log(
      `  Slippage: ${slippageBps} basis points (${slippageBps / 100}%)`
    );
    console.log(`  Min balance: ${minTokenBalance}`);
    console.log(`  Excluded tokens: ${excludeTokens.length}`);

    // Execute the swap
    const result = await swapAllTokensToSolana(
      walletName,
      slippageBps,
      minTokenBalance,
      excludeTokens
    );

    console.log("\n📊 Final Results:");
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n✅ Operation completed successfully!");
      if (result.successfulSwaps.length > 0) {
        console.log(
          `💰 Successfully swapped ${result.successfulSwaps.length} tokens`
        );
        console.log(
          `🎯 Total SOL received: ${result.successfulSwaps
            .reduce((sum, swap) => sum + swap.receivedSol, 0)
            .toFixed(6)} SOL`
        );
      }
    } else {
      console.log("\n❌ Operation completed with errors");
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSwapAllTokens()
    .then(() => {
      console.log("\n🎉 Test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

export { testSwapAllTokens };
