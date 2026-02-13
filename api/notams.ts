import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id = "ARGENTINA", type = "GLOBAL" } = req.query;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const ai = new GoogleGenAI({ apiKey });

  const query =
    type === "AIRPORT"
      ? `Obtén los NOTAM vigentes para el aeródromo ${id} de Argentina.`
      : type === "FIR"
      ? `Obtén los NOTAM vigentes para la FIR ${id} de Argentina.`
      : `Obtén los NOTAM nacionales vigentes de Argentina.`;

  const prompt = `
Analiza información aeronáutica pública y devuelve NOTAMs vigentes.

Devuelve ESTRICTAMENTE JSON con este formato:
{
  "notams": [
    {
      "id": "string",
      "location": "string",
      "message": "string"
    }
  ],
  "isClosed": boolean
}

Contexto: ${query}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");

    // 🔹 ADAPTACIÓN AL FORMATO DEL FRONTEND
    const adaptedNotams = (data.notams || []).map((n: any) => ({
      id: n.id || "N/A",
      title: n.location || id,
      content: n.message || "",
      raw: n.message || "",
      category: "info",
      topic: "AGA"
    }));

    return res.status(200).json({
      notams: adaptedNotams,
      isClosed: !!data.isClosed,
      sources: []
    });
  } catch (error) {
    console.error("NOTAM API error:", error);
    return res.status(500).json({
      notams: [],
      isClosed: false,
      sources: []
    });
  }
}
