import { GoogleGenAI } from "@google/genai";

// Support both the platform's API_KEY and the Vite-style VITE_API_KEY for deployment.
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  // Provide a more generic error message that covers both possibilities.
  throw new Error("API key environment variable is not set. Ensure VITE_API_KEY (for deployment) or API_KEY (for development) is available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface TranslateParams {
  text: string;
  targetLanguage: string;
  signal?: AbortSignal;
}

export const translateStream = async ({ text, targetLanguage, signal }: TranslateParams): Promise<ReadableStream<Uint8Array>> => {
  // Switched to the stateless `generateContentStream` API to guarantee no context leakage.
  // This is a more robust solution for one-off translation tasks than the Chat API.
  const prompt = `You are an expert real-time translator. The user will provide raw, unpunctuated text from a speech-to-text engine. Your task is to first interpret this raw text, inferring natural pauses to add appropriate punctuation (like commas and periods). Then, translate the grammatically corrected text into ${targetLanguage}. The final output should ONLY be the translated text, grammatically correct and properly punctuated. Do not include any explanations, greetings, or commentary. Here is the text: "${text}"`;

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
  
  const readableStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of responseStream) {
          if (signal?.aborted) {
            break;
          }
          
          const chunkText = chunk.text;
          if (chunkText) {
            controller.enqueue(encoder.encode(chunkText));
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error in translation stream pump:", error);
          controller.error(error);
        }
      } finally {
        try {
            controller.close();
        } catch (e) {
            // Controller might already be closed, which is fine.
        }
      }
    },
  });

  return readableStream;
};