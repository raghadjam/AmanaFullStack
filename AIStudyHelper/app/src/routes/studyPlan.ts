import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { GenerateContentConfig } from "@google/genai";

const router = Router();
const GEMINI_MODEL = "gemini-2.5-flash";
let ai: GoogleGenAI;

// Function to safely call Gemini in JSON mode for study plans
async function callGeminiPlan(prompt: string): Promise<string> {
  if (!ai) throw new Error("Gemini AI client not initialized.");

  const generationConfig: GenerateContentConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        plan: {
          type: "array",
          description: "Short 3-step study plan for each wrong item",
          items: {
            type: "object",
            properties: {
              item: { type: "string" },
              steps: {
                type: "array",
                items: { type: "string" },
                description: "Three steps to improve on this item"
              }
            },
            required: ["item", "steps"]
          }
        }
      },
      required: ["plan"]
    },
    maxOutputTokens: 1000,
    temperature: 0.1
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: generationConfig
    });

    const generatedText = response.text;
    if (!generatedText || generatedText.trim() === "") {
      throw new Error("AI output was empty or blocked.");
    }

    return generatedText.trim();
  } catch (err: any) {
    console.error("Gemini API call failed:", err.message || err);
    throw err;
  }
}

// POST /plan
router.post("/", async (req: Request, res: Response) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY)
    return res.status(500).json({ error: "GEMINI_API_KEY missing from environment variables" });

  if (!ai) ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const { wrongItems, contextText } = req.body;

    if (!wrongItems || wrongItems.length === 0)
      return res.json({ plan: [] });

    const safeContext = (contextText || "").slice(0, 15000);

    const prompt = `
You are an educational coach.

The student got these items wrong:
${JSON.stringify(wrongItems, null, 2)}

Use the provided material to produce a short 3-step study plan for each wrong item.
Material:
${safeContext}
`;

    const output = await callGeminiPlan(prompt);
    console.log("RAW PLAN OUTPUT:", output);

    // Return raw JSON string to frontend
    res.json({ plan: output });
  } catch (err: any) {
    res.status(500).json({
      error: "Study plan generation failed",
      details: err.message || "Unknown error occurred"
    });
  }
});

export default router;
