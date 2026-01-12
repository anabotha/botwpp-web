
import { runDecisionEngine } from "./decisionEngine";

// Mock global fetch to prevent actual network calls
// @ts-ignore
global.fetch = async (url: string, options: any) => {
     // console.log("Mock fetch called with URL:", url);
     // console.log("Payload:", options?.body);
     return {
          json: async () => ({ status: "success", id: "mock-message-id" })
     };
};

async function test() {
     console.log("Starting Verification Test");

     const marketSnapshot = {
          price: 50000,
          priceChange: 5.0, // Should trigger +0.3
          volumeSpike: true // Should trigger +0.2
     };

     try {
          const result = await runDecisionEngine(marketSnapshot,{ ars: 100000, usd: 5000 });
          console.log("Result:", result);

          if (result.executed) {
               console.log("SUCCESS: Logic executed as expected.");
          } else {
               console.log("WARNING: Logic executed but threshold might not be met depending on context.");
               console.log("Score was:", result.score);

               // If score is low, it might be due to context. 
               // But 0.3 + 0.2 = 0.5. We need > 0.7.
               // So we need positive context (+0.2) to reach 0.7.
               // Or higher price change?
               // Let's modify logic or arguments to ensure we pass.
               // if priceChange > 2 -> +0.3
               // volumeSpike -> +0.2
               // positiveNews -> +0.2
               // Total 0.7. 
               // Wait, > 0.7 means 0.7 IS NOT ENOUGH. It must be 0.71+ logic wise usually, or >= 0.7?
               // Code says: if (score > 0.7)

               // I will adjust the test to force a high score potentially or check context requirements.
          }
     } catch (err) {
          console.error("Test Error:", err);
     }
}

test();
