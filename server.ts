import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI features will fallback to high-quality simulated answers.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini client:", err);
}

// Helper to query Gemini with fallbacks
async function callGemini(prompt: string, fallbackText: string): Promise<string> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      return response.text || fallbackText;
    } catch (err) {
      console.error("Gemini API error:", err);
      return fallbackText;
    }
  }
  return fallbackText;
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1. Generate AI Review suggestions
app.post("/api/gemini/suggest-reviews", async (req, res) => {
  const { rating, tone, length, language, extraDetails, businessName } = req.body;

  const bName = businessName || "our business";
  const starsStr = `${rating || 5} out of 5 stars`;
  
  const prompt = `You are an AI assistant helping a customer write a Google Review for the business "${bName}". 
Generate exactly 3 diverse, natural-sounding, realistic customer review suggestions based on the following:
- Star Rating: ${starsStr}
- Tone: ${tone || "friendly"}
- Length limit: ${length || "medium"} length (short is 1-2 sentences, medium is 3-4 sentences, long is a full paragraph)
- Language: ${language || "English"}
- Extra context/details: ${extraDetails || "Excellent customer service and highly recommended."}

Return the response in JSON array format containing exactly 3 strings representing the reviews. Do not include markdown block formatting (like \`\`\`json). Just return the raw JSON array of strings:
[
  "Review 1...",
  "Review 2...",
  "Review 3..."
]`;

  const fallback = JSON.stringify([
    `Excellent service! Highly recommend ${bName}. Staff was incredibly professional.`,
    `We had a wonderful experience at ${bName}. Everything went smoothly, and the quality was top notch.`,
    `Very satisfied with ${bName}. The team went above and beyond to make sure we were taken care of.`
  ]);

  try {
    const responseText = await callGemini(prompt, fallback);
    let parsed: string[];
    try {
      // Clean up markdown code blocks if the model accidentally included them
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      parsed = JSON.parse(cleaned.trim());
    } catch (e) {
      console.warn("Failed to parse Gemini suggestions JSON. Using fallback parse.", e);
      parsed = [
        responseText,
        `Great support and smooth experience with ${bName}.`,
        `Highly positive engagement with ${bName}. Will visit again!`
      ];
    }
    res.json({ suggestions: parsed.slice(0, 3) });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

// 2. Rewrite review
app.post("/api/gemini/rewrite-review", async (req, res) => {
  const { text, tone, length, language } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for rewriting" });
  }

  const prompt = `Rewrite the following customer review to make it sound premium and professional:
Review: "${text}"
Desired properties:
- Tone: ${tone || "professional"}
- Length: ${length || "medium"} (short: 1-2 sentences, medium: 3-4 sentences, long: full paragraph)
- Target Language: ${language || "English"}

Return only the rewritten review text. Do not wrap it in quotes, do not add prefixes like "Here is the rewritten review:". Just return the rewritten text directly.`;

  const fallback = `Absolutely loved our experience. The level of care, premium quality, and prompt attention we received was second to none. We will definitely be back.`;

  try {
    const rewritten = await callGemini(prompt, fallback);
    res.json({ rewritten: rewritten.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to rewrite review" });
  }
});

// 3. Generate Reply to review
app.post("/api/gemini/generate-reply", async (req, res) => {
  const { reviewText, reviewerName, rating, tone, businessName } = req.body;

  const bName = businessName || "our business";
  const name = reviewerName || "valued customer";
  const stars = rating || 5;

  const prompt = `You are a business manager representing "${bName}". Write a polite, professional, and custom response to a customer review:
- Reviewer: ${name}
- Star Rating given: ${stars} out of 5 stars
- Customer Review content: "${reviewText || ""}"
- Response Tone: ${tone || "professional"}

Guidelines:
- If positive rating, express sincere gratitude, reference specific points they mentioned if any, and welcome them back.
- If neutral/negative rating, express sincere concern, apologize for the inconvenience, invite them to contact support or management directly, and show a commitment to resolving their issue.
- Keep the length around 2-4 sentences.
- Return ONLY the response text itself. Do not add metadata, prefixes, or sign-offs that are not part of the message. Just write the paragraph.`;

  const positiveFallback = `Thank you so much, ${name}, for your wonderful review! We're thrilled to hear you had an excellent experience with us at ${bName}. Your feedback motivates our team to keep delivering top-notch service. We look forward to welcoming you back soon!`;
  const negativeFallback = `Hello ${name}, thank you for your feedback. We are truly sorry to hear that your experience did not meet expectations. We take these matters seriously and would love to make this right. Please reach out to our team directly so we can resolve this for you.`;

  const fallback = stars >= 4 ? positiveFallback : negativeFallback;

  try {
    const reply = await callGemini(prompt, fallback);
    res.json({ reply: reply.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

// Setup Vite Dev Server / Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReviewPlease fullstack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
