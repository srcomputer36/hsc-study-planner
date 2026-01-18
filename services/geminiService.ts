
import { GoogleGenAI, Type } from "@google/genai";
import { QuestionPair } from "../types";

export interface StudyTipResponse {
  text: string;
  sources: { title: string; uri: string }[];
  detectedDate?: string;
  error?: string;
}

export interface ExamQuestionsResponse {
  mcqs: QuestionPair[];
  cqs: QuestionPair[];
}

export interface GradingResult {
  totalScore: number;
  maxScore: number;
  feedback: { questionIndex: number; score: number; comment: string }[];
  remarks: string;
}

// Optimization: Use Lite model for bulk generation and standard for complex search
const SEARCH_MODEL = 'gemini-3-flash-preview';
const LITE_MODEL = 'gemini-flash-lite-latest';

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key === '') {
    throw new Error("API_KEY পাওয়া যায়নি।");
  }
  return key;
};

const handleAiError = (error: any): string => {
  const errMsg = String(error);
  if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("limit")) {
    return "গুগলের ফ্রি লিমিট (Quota) শেষ হয়েছে। দয়া করে ১ মিনিট অপেক্ষা করে আবার চেষ্টা করুন। এই সময় আপনি লোকাল মোডে পরীক্ষা দিতে পারবেন।";
  }
  if (errMsg.includes("404")) return "এআই সার্ভার খুঁজে পাওয়া যাচ্ছে না।";
  if (errMsg.includes("500")) return "গুগল সার্ভারে সমস্যা হচ্ছে, একটু পর চেষ্টা করুন।";
  return "কানেকশনে সমস্যা হয়েছে। ইন্টারনেট চেক করে আবার চেষ্টা করুন।";
};

export async function generateAiQuestions(subjectName: string): Promise<ExamQuestionsResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: `Generate 10 board-standard MCQ and 5 CQ questions for HSC ${subjectName} in Bengali.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            cqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["mcqs", "cqs"]
        }
      }
    });

    return JSON.parse(response.text || '{"mcqs":[], "cqs":[]}');
  } catch (error) {
    throw new Error(handleAiError(error));
  }
}

export async function getQuickAnswer(subjectName: string, query: string): Promise<StudyTipResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Subject: ${subjectName}. Question: ${query}`,
      config: {
        systemInstruction: `You are an expert HSC teacher. Answer concisely in Bengali.`,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "উত্তর পাওয়া যায়নি।";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "সূত্র",
        uri: chunk.web?.uri || "#"
      }));

    return { text, sources };
  } catch (error) {
    return { text: handleAiError(error), sources: [], error: String(error) };
  }
}

export async function getLatestBoardNews(): Promise<StudyTipResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Latest HSC Exam news Bangladesh boards 2025-26.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });
    const text = response.text || "নতুন কোনো নিউজ পাওয়া যায়নি।";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.filter(chunk => chunk.web).map(chunk => ({
      title: chunk.web?.title || "সোর্স",
      uri: chunk.web?.uri || "#"
    }));
    return { text, sources };
  } catch (error) {
    return { text: "নিউজ লোড করা যায়নি। ১ মিনিট পর চেষ্টা করুন।", sources: [], error: handleAiError(error) };
  }
}

export async function gradeExamSubmission(questions: QuestionPair[], userAnswers: string[]): Promise<GradingResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: `Grade these HSC student answers: ${JSON.stringify({questions, userAnswers})}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            remarks: { type: Type.STRING },
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionIndex: { type: Type.NUMBER },
                  score: { type: Type.NUMBER },
                  comment: { type: Type.STRING }
                }
              }
            }
          },
          required: ["totalScore", "maxScore", "remarks", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw new Error(handleAiError(error));
  }
}
