
export type AppView = 'home' | 'rwy' | 'notam';

export enum PlaceType {
  LAD = 'LAD',
  LADH = 'LADH',
  LADA = 'LADA'
}

export interface DMSCoordinate {
  degrees: string;
  minutes: string;
  seconds: string;
}

export interface GeolocationPoint {
  lat: DMSCoordinate;
  lng: DMSCoordinate;
  elevation: string;
  label: string;
}

export type LocationType = 'AIRPORT' | 'FIR' | 'GLOBAL';

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  isClosed?: boolean;
}

export interface FIR {
  icao: string;
  name: string;
  lat: number;
  lng: number;
  radius?: number;
}

export interface Notam {
  id: string;
  title: string;
  content: string;
  raw?: string;
  category: 'critical' | 'warning' | 'info';
  topic?: 'AGA' | 'ANS' | 'COM' | 'MET' | 'RAC' | 'OTHERS';
  timestamp?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface NotamAnalysisResponse {
  notams: Notam[];
  sources: GroundingSource[];
  isClosed: boolean;
}
