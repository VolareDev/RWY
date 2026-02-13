export default async function handler(req: any, res: any) {
  try {
    const { icao } = req.query;

    if (!icao || typeof icao !== "string") {
      return res.status(400).json({
        notams: [],
        isClosed: false,
        sources: [],
        error: "Missing ICAO parameter (?icao=SAEZ)",
      });
    }

    const FAA_BASE = process.env.FAA_API_BASE;

    if (!FAA_BASE) {
      return res.status(500).json({
        notams: [],
        isClosed: false,
        sources: [],
        error: "FAA_API_BASE not configured",
      });
    }

    const response = await fetch(
      `${FAA_BASE}/notams?location=${icao}&format=json`
    );

    if (!response.ok) {
      throw new Error("FAA API request failed");
    }

    const data = await response.json();

    const notams = (data.items || []).map((n: any) => ({
      id: n.notamNumber || "UNKNOWN",
      title: `NOTAM ${n.notamNumber || ""}`,
      content: n.text || "",
      raw: n.text || "",
      category: /CLSD|CLOSED|RWY|RUNWAY/i.test(n.text)
        ? "critical"
        : "info",
      topic: "AGA",
      start: n.effectiveStart || null,
      end: n.effectiveEnd || null,
    }));

    const isClosed = notams.some((n: any) =>
      /AD CLSD|AERODROME CLOSED|AIRPORT CLOSED/i.test(n.raw)
    );

    return res.status(200).json({
      notams,
      isClosed,
      sources: ["FAA"],
    });
  } catch (error) {
    console.error("NOTAM API error
