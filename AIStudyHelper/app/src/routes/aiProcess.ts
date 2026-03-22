import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { GenerateContentConfig } from '@google/genai'; // Import type for config

const router = Router();
const GEMINI_MODEL = "gemini-2.5-flash"; 
let ai: GoogleGenAI;

// Function to safely call the Gemini API in JSON Mode
async function callGemini(prompt: string): Promise<string> {
  if (!ai) {
    throw new Error("Gemini AI client not initialized.");
  }

  // 1. JSON Configuration
  const generationConfig: GenerateContentConfig = {
    // Force the model to output a single JSON object
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            // Define the structure your frontend needs
            summary: { type: "string", description: "A 3-6 sentence summary of the material." },
            flashcards: {
                type: "array",
                description: "Five flashcards.",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        answer: { type: "string" }
                    },
                    required: ["question", "answer"]
                }
            },
            quiz: {
                type: "array",
                description: "Five multiple-choice questions.",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: { 
                            type: "object",
                            properties: {
                                A: { type: "string" },
                                B: { type: "string" },
                                C: { type: "string" },
                                D: { type: "string" }
                            },
                            required: ["A", "B", "C", "D"]
                        },
                        correctAnswer: { type: "string", description: "The letter (A, B, C, or D) of the correct option." }
                    },
                    required: ["question", "options", "correctAnswer"]
                }
            }
        },
        required: ["summary", "flashcards", "quiz"]
    },
    // General config
    maxOutputTokens: 2000, 
    temperature: 0.1, // Very low temp for structured output
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: generationConfig, // Use the JSON config
    });

    const generatedText = response.text; 
    
    if (!generatedText || generatedText.trim() === '') {
        console.error("Gemini API returned an empty response in JSON mode.");
        throw new Error("AI output was empty or blocked.");
    }
    
    return generatedText.trim();

  } catch (err: any) {
    console.error("Gemini API call failed:", err.message || err);
    throw err;
  }
}

// POST /process
router.post("/", async (req: Request, res: Response) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY missing from environment variables" });
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  try {
    const { text } = req.body;
    const safeText = (text || "").trim().slice(0, 25000);

    // 2. Updated Prompt: Now just instructs the model on what to produce
    const prompt = `
You are an educational assistant. Process the material provided below and generate a JSON object that strictly adheres to the provided schema. The output must contain the summary, five flashcards, and five multiple-choice questions.

Material to Process:
---
${safeText}
---
`;

    const output = await callGemini(prompt);
    // console.log("RAW GEMINI OUTPUT:", output);
    // Return the raw JSON string back to the frontend
    res.json({ output }); 

  } catch (err: any) {
    res
      .status(500)
      .json({ error: "AI processing failed", details: err.message || "An unknown error occurred." });
  }
});

export default router;