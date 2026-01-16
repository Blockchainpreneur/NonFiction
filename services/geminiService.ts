
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Ensure we have a valid key. In this environment, process.env.API_KEY is provided.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePlaylistContent = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find 10 exact, high-impact textual fragments from non-fiction books about: "${prompt}". 
    Rules:
    1. Must be verbatim text.
    2. Provide book title and author for each.
    3. Generate 3-5 relevant tags.
    4. Focus on transformative knowledge.
    5. Return ONLY a valid JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          fragments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                book_title: { type: Type.STRING },
                author: { type: Type.STRING },
                text_original: { type: Type.STRING },
              },
              required: ["book_title", "author", "text_original"]
            }
          }
        },
        required: ["title", "tags", "fragments"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  // Remove potential markdown code blocks
  const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  
  try {
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini JSON response:", text);
    throw new Error("Invalid response format from AI");
  }
};

export const generateSpeechForFragment = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this book fragment clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.error("Gemini TTS returned no audio data", response);
      return undefined;
    }
    return base64Audio;
  } catch (error) {
    console.error("Detailed Speech Generation Error:", error);
    throw error;
  }
};
