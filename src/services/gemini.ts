import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { IdentificationResult, FunFact, TrendingTopic, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DailyData {
  funFact: FunFact;
  trendingTopics: TrendingTopic[];
  quiz: QuizQuestion[];
}

// Helper for caching
async function withCache<T>(key: string, fetcher: () => Promise<T>, expiryHours: number = 24): Promise<T> {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp < expiryHours * 60 * 60 * 1000) {
        return data as T;
      }
    } catch (e) {
      console.error("Cache parsing error:", e);
    }
  }

  const data = await fetcher();
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

export async function identifyImage(base64Data: string): Promise<IdentificationResult> {
  const model = ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [
      {
        parts: [
          {
            text: `Identify the main subject in this image. 
            Provide the response in JSON format with the following structure:
            {
              "name": "Common name",
              "category": "Category",
              "confidence": 0.95,
              "description": "Brief overview",
              "emoji": "A single representative emoji for this subject",
              "sections": [
                {
                  "title": "Section Title (e.g. 物理特性, 历史渊源, 使用建议, etc.)",
                  "icon": "Lucide icon name (e.g. Info, History, Shield, Zap, etc.)",
                  "content": "Detailed markdown content. Focus on unique insights for this section."
                }
              ]
            }
            Respond only in Chinese. Choose 4-5 distinct, non-redundant sections that provide a comprehensive and modular explanation of the subject.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      maxOutputTokens: 1024,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          emoji: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                icon: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "icon", "content"]
            }
          }
        },
        required: ["name", "category", "description", "emoji", "sections"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}") as IdentificationResult;
}

export async function askQuestion(subject: string, question: string, history: { role: 'user' | 'model', text: string }[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3.1-flash-lite-preview",
    config: {
      systemInstruction: `你是一个关于万物的百科全书专家。当前用户正在查看关于 "${subject}" 的信息。请根据用户的提问提供专业、准确且有趣的解答。使用中文回复。`
    }
  });

  const response = await chat.sendMessage({ message: question });
  return response.text;
}

export async function getDailyData(): Promise<DailyData> {
  return withCache("daily_data_v6", async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `请同时生成以下三类科普内容：
      1. 一个有趣的万物科普小知识 (funFact)。
      2. 5个当前热门科普知识排行榜 (trendingTopics)。
      3. 3道有趣的科普知识测试题 (quiz)。
      
      返回 JSON 格式，结构如下：
      {
        "funFact": { "title": "", "content": "", "emoji": "一个与内容匹配的 emoji" },
        "trendingTopics": [ { "rank": 1, "title": "", "summary": "", "detail": "", "emoji": "一个与内容匹配的 emoji" } ],
        "quiz": [ { "question": "", "options": ["", "", "", ""], "answerIndex": 0, "explanation": "" } ]
      }
      请确保内容科学、准确且极其有趣。`,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data as DailyData;
  });
}

export async function getDailyFunFact() {
  const data = await getDailyData();
  return data.funFact;
}

export async function getTrendingTopics() {
  const data = await getDailyData();
  return data.trendingTopics;
}

export async function getDailyQuiz() {
  const data = await getDailyData();
  return data.quiz;
}
