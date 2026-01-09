
import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysisResult, GroundedPlace, GeoLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findNearbyMechanics = async (location: GeoLocation): Promise<GroundedPlace[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 3 highly-rated tire repair shops or puncture mechanics very close to this location.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!chunks) return [];

    return chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri,
        snippet: chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]
      }));
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return [];
  }
};

export const analyzeTirePhoto = async (base64Image: string): Promise<PhotoAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
            isValid: { type: Type.BOOLEAN },
            brightness: { type: Type.STRING, enum: ["low", "ok", "high"] },
            blur: { type: Type.STRING, enum: ["high", "ok"] },
            isTire: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isValid", "brightness", "blur", "isTire", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as PhotoAnalysisResult;
  } catch (error) {
    return {
      isValid: true,
      brightness: 'ok',
      blur: 'ok',
      isTire: true,
      feedback: "Validation skipped."
    };
  }
};
