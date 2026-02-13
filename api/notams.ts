import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, type } = req.query;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "No API KEY" });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Obten NOTAMs vigentes de Argentina para ${type} ${id}.
  Devuelve JSON con:
  { notams: [], isClosed: boolean }`;

  try {
    const r = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(r.text || "{}"));
  } catch {
    res.json({ notams: [], isClosed: false });
  }
}
