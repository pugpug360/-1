import { GoogleGenAI } from "@google/genai";
import { SearchResponse, Category } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Strength and Conditioning Coach and Sport Scientist (PhD level). 
Your audience consists of other professional coaches and athletes in Taiwan.

When asked about a topic, you must:
1. Search for the LATEST peer-reviewed literature (2024-2025 preferred, 2023 acceptable, seminal works allowed).
2. Synthesize the information into a structured report.
3. Be strictly evidence-based. If research is inconclusive, state that clearly.
4. Output formatting: Use Markdown headers (##, ###) and bold text (**) for readability.

IMPORTANT: You must ALWAYS respond in Traditional Chinese (Taiwan/zh-TW).
`;

export const generateLiteratureReview = async (topic: string, category: Category): Promise<SearchResponse> => {
  try {
    const prompt = `
    Please conduct a comprehensive literature review on: "${topic}" specifically relating to the category of ${category}.
    
    Guidelines:
    1. Search for the absolute latest peer-reviewed studies (Focus on 2023-2025).
    2. Synthesize findings into a professional report in Traditional Chinese (Taiwan).
    3. Be critical: Discuss sample sizes, populations (elite vs untrained), and methodology.
    
    Structure the response in Markdown (zh-TW):
    ## 文獻綜述摘要 (Executive Summary)
    - Provide a concise 2-3 sentence summary.
    
    ## 關鍵研究發現 (Key Research Findings)
    - List 3-5 specific findings from recent studies.
    - Cite the papers contextually if possible.
    
    ## 實務應用建議 (Practical Applications)
    - How should a coach apply this in the gym tomorrow?
    - Be specific (sets, reps, rest, selection).
    
    ## 研究限制與未知 (Limitations)
    - What do we still not know?
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.3, 
      },
    });

    const text = response.text || "無法生成內容，請稍後再試。";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text,
      groundingMetadata: groundingMetadata as any,
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string): Promise<SearchResponse> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
      history: history,
    });

    const response = await chat.sendMessage({ message: newMessage });
    
    return {
      text: response.text || "",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata as any
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};