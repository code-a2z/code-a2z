import { GEMINI_API_KEY } from "./src/config/env.js"; 

export async function getAIRecommendation(analysisData) {
  const prompt = `
You are an AI recommendation system.
Based on the following analysis of repos of github, generate clear recommendations of what tech stack should be learned to improve skills according to tech stack and also tell some future project ideas that can be built using the current skills and the recommended skills.

Analysis:
${JSON.stringify(analysisData, null, 2)}
`;

  const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,


    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();
  
  console.log("Raw Gemini response:", JSON.stringify(data, null, 2));
  if (!data.candidates || data.candidates.length === 0) {
  throw new Error("Gemini returned no response");
}

return data.candidates[0].content.parts[0].text;

}
