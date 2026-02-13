import { LocationType, NotamAnalysisResponse } from "../types";

export async function fetchNotams(
  id: string,
  type: LocationType
): Promise<NotamAnalysisResponse> {
  const r = await fetch(`/api/notams?id=${id}&type=${type}`);
  return r.json();
}
