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
      }
    } catch (fallbackError) {
      console.error("Gemini Error:", fallbackError);
    }
    throw new Error('VITE_GEMINI_API_KEY is missing');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
