
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticState, PriorityAnalysis, StrategicReport } from "../types";

export const getIntelligentInsights = async (state: DiagnosticState, priority: PriorityAnalysis): Promise<StrategicReport | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const diagnosticSummary = Object.entries(state.responses)
      .map(([qId, res]) => {
        const scoreText = res.score < 40 ? "Crítico" : res.score < 70 ? "Regular" : "Bom";
        return `- Ponto: ${qId} | Status: ${scoreText} | Obs: ${res.observation || 'N/A'}`;
      })
      .join('\n');

    const prompt = `
      Você é um consultor sênior da Efraim Gestão Inteligente.
      Analise o diagnóstico 360º da empresa ${state.clientInfo.nomeFantasia}.
      
      FOCO PRINCIPAL: ${priority.areaName} - Motivo: ${priority.message}.
      
      DADOS:
      ${diagnosticSummary}

      Gere um JSON com:
      1. sumarioExecutivo (string curta e impactante)
      2. swot (forcas, fraquezas, oportunidades, ameacas - arrays de string)
      3. ishikawa (categoria e causa - array de objetos)
      4. plano5W2H (oQue, porQue, quem, onde, quando, como, quanto - array de objetos)
      5. pdca (fase e descricao - array de objetos)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sumarioExecutivo: { type: Type.STRING },
            swot: {
              type: Type.OBJECT,
              properties: {
                forcas: { type: Type.ARRAY, items: { type: Type.STRING } },
                fraquezas: { type: Type.ARRAY, items: { type: Type.STRING } },
                oportunidades: { type: Type.ARRAY, items: { type: Type.STRING } },
                ameacas: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            ishikawa: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoria: { type: Type.STRING },
                  causa: { type: Type.STRING }
                }
              }
            },
            plano5W2H: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  oQue: { type: Type.STRING },
                  porQue: { type: Type.STRING },
                  quem: { type: Type.STRING },
                  onde: { type: Type.STRING },
                  quando: { type: Type.STRING },
                  como: { type: Type.STRING },
                  quanto: { type: Type.STRING }
                }
              }
            },
            pdca: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fase: { type: Type.STRING },
                  descricao: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr.trim()) as StrategicReport;
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return null; // Retorna null para disparar o relatório de contingência no componente
  }
};
