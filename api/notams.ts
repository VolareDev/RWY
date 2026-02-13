import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    const { id, type } = req.query;

    if (!id || !type) {
      return res.status(400).json({
        notams: [],
        isClosed: false,
        sources: [],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key not configured",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const query =
      type === "AIRPORT"
        ? `Obtén los NOTAM vigentes para el aeródromo ${id} de Argentina.`
        : type === "FIR"
        ? `Obtén los NOTAM vigentes para la FIR ${id} de Argentina.`
        : `Obtén NOTAMs nacionales de Argentina.`;

    const prompt = `
Analiza información aeronáutica y devuelve NOTAMs.
Traduce a español aeronáutico claro.

Devuelve SOLO este JSON:
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

Contexto: ${query}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");

    return res.status(200).json({
      notams: data.notams || [],
      isClosed: !!data.isClosed,
      sources: ["Gemini + Web"],
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      notams: [],
      isClosed: false,
      sources: [],
    });
  }
}
