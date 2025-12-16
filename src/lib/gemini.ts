import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// API key is read from GEMINI_API_KEY environment variable
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. Gemini AI features will not work.");
}

export const gemini = new GoogleGenAI({ apiKey: geminiApiKey || "" });

// Default model for generation
export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Generate a personified AI response using Gemini
 * @param systemPrompt - The system prompt defining the AI's persona
 * @param userMessage - The user's message to respond to
 * @param chatHistory - Optional array of previous messages for context
 * @returns The AI-generated response text
 */
export const generateGeminiResponse = async (
  systemPrompt: string,
  userMessage: string,
  chatHistory?: { role: "user" | "model"; text: string }[]
): Promise<string | null> => {
  try {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Build the full prompt with system context and chat history
    let fullPrompt = `${systemPrompt}\n\n`;

    // Add chat history context if provided
    if (chatHistory && chatHistory.length > 0) {
      fullPrompt += "Previous conversation:\n";
      for (const msg of chatHistory) {
        const roleLabel = msg.role === "user" ? "User" : "You";
        fullPrompt += `${roleLabel}: ${msg.text}\n`;
      }
      fullPrompt += "\n";
    }

    fullPrompt += `User's current message: ${userMessage}\n\nYour response:`;

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullPrompt,
    });

    return response.text || null;
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    return null;
  }
};

/**
 * Generate a personified response as the creator
 * @param creatorPersona - Description of how the creator communicates
 * @param userMessage - The incoming message to respond to
 * @param chatHistory - Previous messages for context
 * @returns AI-generated response in the creator's voice
 */
export const generatePersonifiedResponse = async (
  creatorPersona: string,
  userMessage: string,
  chatHistory?: { role: "user" | "model"; text: string }[]
): Promise<string | null> => {
  const systemPrompt = `You are responding as a social media creator/business owner on Instagram DMs. 

${creatorPersona}

Guidelines:
- Keep responses friendly, natural, and conversational
- Stay in character as the creator
- Be helpful and engage authentically
- Keep responses concise (1-3 sentences typically)
- Don't mention you're an AI - respond as the creator would
- Use the conversation history to maintain context and continuity`;

  return generateGeminiResponse(systemPrompt, userMessage, chatHistory);
};
