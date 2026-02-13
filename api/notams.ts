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
      ? `aeropuerto ${id}`
      : type === "FIR"
      ? `FIR ${id}`
      : `Argentina nacional`;

  const prompt = `
Usa búsqueda web (AIS / NOTAM Argentina / FIR Ezeiza / ANAC / EANA)
para obtener NOTAMs REALES y VIGENTES.

NO inventes información.
Si no hay NOTAMs activos, devuelve lista vacía.

Devuelve SOLO JSON con este formato:
{
  "notams": [
    {
      "id": "A0000/24",
      "location": "SAEZ",
      "message": "texto NOTAM original"
    }
  ],
  "isClosed": boolean
}

Contexto específico de búsqueda:
NOTAM ${query}
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
    console.error("NOTAM serverless error:", error);
    return res.status(500).json({
      notams: [],
      isClosed: false,
      sources: []
    });
  }
}
