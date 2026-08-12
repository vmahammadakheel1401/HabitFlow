// Sync: 2026-08-12T01:34:22
import { GoogleGenAI } from '@google/genai';

export async function generateGeminiContent(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6KgcH9RqipOUzC3JG4k7dqNvhG8cz7B4eYQ8qBKMpBqYw';

  if (!apiKey) {
    // Check fallback server endpoint if available
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.text) return data.text;
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Something went wrong with the AI Coach. Please try again.");
      }
    } catch (fallbackError: any) {
      console.error("Gemini fallback Error safely caught");
      if (fallbackError?.message?.includes("AI Coach")) {
        throw fallbackError;
      }
      throw new Error("Something went wrong with the AI Coach. Please try again.");
    }
    throw new Error("Something went wrong with the AI Coach. Please try again.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error safely caught");
    const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      throw new Error("AI Coach is temporarily unavailable. Please try again later.");
    }
    throw new Error("Something went wrong with the AI Coach. Please try again.");
  }
}
// Final Sync: 2026-08-12T01:48:00
