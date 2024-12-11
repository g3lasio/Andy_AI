import OpenAI from "openai";
import type { Transaction, CreditReport } from "@db/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AIAnalysisResult {
  creditAdvice: string[];
  financialHealth: {
    score: number;
    status: string;
    recommendations: string[];
  };
  futureProjection: {
    trend: "positive" | "neutral" | "negative";
    probability: number;
    reasons: string[];
  };
}

async function analyzeFinancialData(
  transactions: Transaction[],
  creditReport: CreditReport
): Promise<AIAnalysisResult> {
  const prompt = `Analiza los siguientes datos financieros y proporciona recomendaciones detalladas:
  
  Historial de Transacciones: ${JSON.stringify(transactions)}
  Reporte de Crédito: ${JSON.stringify(creditReport)}
  
  Por favor, proporciona un análisis completo en formato JSON que incluya:
  1. Consejos específicos para mejorar el puntaje crediticio
  2. Estado de salud financiera actual con recomendaciones
  3. Proyección futura basada en patrones actuales
  
  Responde en español y en formato JSON siguiendo exactamente esta estructura:
  {
    "creditAdvice": ["consejo1", "consejo2", ...],
    "financialHealth": {
      "score": (número del 1-100),
      "status": "texto descriptivo",
      "recommendations": ["recomendación1", "recomendación2", ...]
    },
    "futureProjection": {
      "trend": "positive/neutral/negative",
      "probability": (número del 0-1),
      "reasons": ["razón1", "razón2", ...]
    }
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateChatResponse(
  message: string,
  context: {
    transactions: Transaction[];
    creditReport: CreditReport;
    previousMessages: { role: string; content: string }[];
  }
): Promise<string> {
  const systemPrompt = `Eres Andy AI, un asistente financiero personal experto en finanzas personales y crédito. 
  Tu objetivo es ayudar a los usuarios a mejorar su situación financiera y crediticia.
  
  Reglas importantes:
  1. Responde siempre en español de manera amigable y profesional
  2. Proporciona consejos prácticos y accionables
  3. Si detectas patrones financieros preocupantes, menciónalos con tacto
  4. Explica conceptos financieros de manera simple
  5. Mantén un tono positivo y motivador
  
  Contexto actual del usuario:
  - Transacciones recientes: ${JSON.stringify(context.transactions)}
  - Reporte de crédito: ${JSON.stringify(context.creditReport)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...context.previousMessages,
      { role: "user", content: message }
    ]
  });

  return response.choices[0].message.content;
}

export { analyzeFinancialData, generateChatResponse };
