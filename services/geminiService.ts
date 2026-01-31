
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  /**
   * Generates text content using the Gemini model.
   * Initializes GoogleGenAI immediately before the call as per guidelines.
   */
  async generateSimpleText(prompt: string): Promise<string | undefined> {
    try {
      // Create a new instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      // Correctly access text property directly (not as a method)
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
