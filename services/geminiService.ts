import { LocationType, NotamAnalysisResponse } from "../types";

export async function fetchNotams(
  id: string,
  type: LocationType
): Promise<NotamAnalysisResponse> {
  try {
    // solo aeródromos por ahora
    if (type !== "AIRPORT") {
      return { notams: [], sources: [], isClosed: false };
    }

    const res = await fetch(`/api/notams?icao=${id}`);

    if (!res.ok) {
      throw new Error("API /api/notams failed");
    }

    const data = await res.json();

    return {
      notams: data.notams || [],
      sources: data.sources || [],
      isClosed: !!data.isClosed,
    };
  } catch (err) {
    console.error("fetchNotams error:", err);
    return { notams: [], sources: [], isClosed: false };
  }
}
