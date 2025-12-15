import { GoogleGenAI, Type } from "@google/genai";
import { BusinessInfo, CampaignStrategy, Keyword, AdCreative } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

export const generateStrategy = async (info: BusinessInfo): Promise<CampaignStrategy> => {
  const prompt = `
    Act as a senior Google Ads specialist. Based on the following business, develop a high-level campaign strategy.
    
    Business Name: ${info.name}
    Website: ${info.website}
    Description: ${info.description}
    Target Audience: ${info.audience}
    Monthly Budget: ${info.budget}

    Determine the best Campaign Goal (e.g., Sales, Leads, Traffic), Bidding Strategy (e.g., Maximize Conversions, Target CPA), which Networks to target (Search, Display, etc.), and suggested Locations. Provide a short rationale.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING },
          biddingStrategy: { type: Type.STRING },
          networks: { type: Type.ARRAY, items: { type: Type.STRING } },
          locations: { type: Type.ARRAY, items: { type: Type.STRING } },
          rationale: { type: Type.STRING },
        },
        required: ["goal", "biddingStrategy", "networks", "locations", "rationale"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as CampaignStrategy;
};

export const generateKeywords = async (info: BusinessInfo, strategy: CampaignStrategy): Promise<Keyword[]> => {
  const prompt = `
    Generate a list of high-intent Google Ads keywords for this business.
    Business: ${info.description}
    Audience: ${info.audience}
    Goal: ${strategy.goal}
    
    Provide 10-15 keywords with mixed match types (Broad, Phrase, Exact) that are most likely to drive high-quality traffic.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            matchType: { type: Type.STRING, enum: ["Broad", "Phrase", "Exact"] },
            intent: { type: Type.STRING, description: "Transactional, Informational, or Navigational" },
          },
          required: ["text", "matchType", "intent"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as Keyword[];
};

export const generateAdCreative = async (info: BusinessInfo, keywords: Keyword[]): Promise<AdCreative> => {
  const keywordList = keywords.slice(0, 10).map(k => k.text).join(", ");
  const prompt = `
    Write excellent Google Search Ad copy for the following business.
    Business: ${info.name} - ${info.description}
    Target Keywords: ${keywordList}
    
    Strict Google Ads Constraints:
    - Headlines: Max 30 characters each. Generate 5 variations.
    - Descriptions: Max 90 characters each. Generate 3 variations.
    
    Make them punchy, action-oriented, and include the keyword where possible.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
          descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["headlines", "descriptions"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AdCreative;
};
