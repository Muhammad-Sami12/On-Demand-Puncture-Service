import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysisResult } from "../types";

// Initialize Gemini Client
// NOTE: API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTirePhoto = async (base64Image: string): Promise<PhotoAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this image for a tire repair service validation. 
            1. Is there a car tire or wheel visible in the image?
            2. Is the image too dark (brightness)?
            3. Is the image too blurry?
            
            Provide the output in JSON format.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "True if a tire is visible and quality is acceptable." },
            brightness: { type: Type.STRING, enum: ["low", "ok", "high"] },
            blur: { type: Type.STRING, enum: ["high", "ok"] },
            isTire: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Short constructive feedback for the technician." }
          },
          required: ["isValid", "brightness", "blur", "isTire", "feedback"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
       throw new Error("Empty response from AI");
    }
    
    return JSON.parse(resultText) as PhotoAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of error to allow flow to continue in demo
    return {
      isValid: true,
      brightness: 'ok',
      blur: 'ok',
      isTire: true,
      feedback: "AI validation unavailable. Proceeding manually."
    };
  }
};