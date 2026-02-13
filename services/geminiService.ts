
import { GoogleGenAI } from "@google/genai";
import { LocationType, NotamAnalysisResponse } from "../types";

export async function fetchNotams(id: string, type: LocationType): Promise<NotamAnalysisResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const query = type === 'AIRPORT' 
    ? `Obtén los NOTAM vigentes para el aeródromo ${id} de Argentina. Identifica cierres de pista, fallas de radio, o servicios MET afectados.` 
    : type === 'FIR' 
    ? `Obtén los NOTAM vigentes para la región de información de vuelo (FIR) ${id} de Argentina. Busca alertas de navegación ANS y servicios COM.` 
    : `Encuentra NOTAMs críticos nacionales de Argentina (Avisos de navegación, peligros, restricciones temporales).`;

  const prompt = `Analiza la información de búsqueda y extrae los NOTAMs vigentes.
  Traduce cada NOTAM a lenguaje claro (español aeronáutico comprensible).
  
  CLASIFICACIÓN POR TEMA (Strictly use these tags):
  - AGA: Aeródromos (pistas, calles de rodaje, luces)
  - ANS: Servicios de Navegación Aérea (procedimientos, ayudas)
  - COM: Comunicaciones (frecuencias, radios)
  - MET: Meteorología
  - RAC: Reglas de Aire y Control
  - OTHERS: Otros temas

  Para cada NOTAM, incluye obligatoriamente el mensaje en "raw" (el texto aeronáutico original sin procesar).
  Para aeropuertos, determina si está totalmente cerrado (isClosed: true/false).
  Clasifica por categoría (critical, warning, info).
  
  Retorna estrictamente un objeto JSON con este formato:
  {
    "notams": [{ 
      "id": "string", 
      "title": "string", 
      "content": "string", 
      "raw": "string", 
      "category": "critical|warning|info", 
      "topic": "AGA|ANS|COM|MET|RAC|OTHERS" 
    }],
    "isClosed": boolean
  }
  
  Contexto actual: ${query}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Fuente de Información',
      uri: chunk.web?.uri || '#'
    })) || [];

    return {
      notams: data.notams || [],
      sources: sources,
      isClosed: !!data.isClosed
    };
  } catch (error) {
    console.error("Gemini NOTAM fetch failed", error);
    return { notams: [], sources: [], isClosed: false };
  }
}
