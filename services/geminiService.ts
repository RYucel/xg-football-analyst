
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateMatchAnalysis = async (homeTeam: string, awayTeam: string): Promise<string> => {
  const prompt = `Act as an expert football analyst. Provide a concise pre-match analysis for the upcoming match between ${homeTeam} and ${awayTeam}. 
  
  Please include the following sections:
  - **Match Overview:** A brief summary of the match's importance and context.
  - **Recent Form:** Analysis of both teams' recent performances (last 5 games).
  - **Key Players to Watch:** Highlight one key player from each team and why they are important.
  - **Tactical Considerations:** Briefly touch upon potential match dynamics or tactical battles.
  - **Prediction:** Your final prediction for the match outcome.
  
  Keep the analysis clear, insightful, and easy to read. Use markdown for formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("AI analysis could not be generated at this time. Please try again later.");
  }
};
