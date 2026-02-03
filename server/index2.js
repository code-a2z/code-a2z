import "dotenv/config";

import { analyzeUser } from "./src/services/index.js";
import { getAIRecommendation } from "./gemini.js";

async function run() {
  try {
    const analysis = await analyzeUser("facebook");
    await getAIRecommendation({ test: "hello" });
    const aiResult = await getAIRecommendation(analysis);
    console.log(aiResult);
  } catch (err) {
    console.error(err);
  }
}

run();