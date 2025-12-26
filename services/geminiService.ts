
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticState, PriorityAnalysis, StrategicReport } from "../types";

export const getIntelligentInsights = async (state: DiagnosticState, priority: PriorityAnalysis): Promise<StrategicReport | null> => {
  // Always use a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date configuration.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construindo um resumo dos dados para a IA
  const diagnosticSummary = Object.entries(state.responses)
    .map(([qId, res]) => {
      const scoreText = res.score < 40 ? "Crítico" : res.score < 70 ? "Regular" : "Bom";
      return `- Ponto: ${qId} | Status: ${scoreText} | Obs: ${res.observation || 'N/A'}`;
    })
    .join('\n');

  const prompt = `
    Você é um consultor sênior da Efraim Gestão Inteligente.
    Analise o diagnóstico 360º da empresa ${state.clientInfo.nomeFantasia}.
    
    FOCO PRINCIPAL (Prioridade Crítica): ${priority.areaName} - Motivo: ${priority.message}.
    
    DADOS DO DIAGNÓSTICO:
    ${diagnosticSummary}

    Gere um relatório estratégico completo contendo:
    1. Um sumário executivo impactante.
    2. Análise SWOT (4 pontos para cada quadrante).
    3. Diagrama de Ishikawa (Causa e Efeito) para o problema principal (${priority.areaName}).
    4. Um plano de ação 5W2H com 4 ações práticas.
    5. Um roteiro resumido seguindo o ciclo PDCA.

    Retorne estritamente em JSON seguindo o esquema definido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex Text Tasks
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
              },
              required: ["forcas", "fraquezas", "oportunidades", "ameacas"]
            },
            ishikawa: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoria: { type: Type.STRING, description: "Ex: Métodos, Mão de Obra, Máquinas, Medida, Meio Ambiente, Materiais" },
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
          },
          required: ["sumarioExecutivo", "swot", "plano5W2H", "pdca", "ishikawa"]
        }
      }
    });

    // Accessing .text property directly as it is not a method.
    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr.trim()) as StrategicReport;
  } catch (error) {
    console.error("Gemini Multi-Framework Error:", error);
    return null;
  }
};
