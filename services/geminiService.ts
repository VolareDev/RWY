import { LocationType, NotamAnalysisResponse } from "../types";

export async function fetchNotams(
  id: string,
  type: LocationType
): Promise<NotamAnalysisResponse> {
  try {
    const res = await fetch(`/api/notams?id=${id}&type=${type}`);

    if (!res.ok) throw new Error("API error");

    return await res.json();
  } catch (e) {
    console.error(e);
    return { notams: [], sources: [], isClosed: false };
  }
}
