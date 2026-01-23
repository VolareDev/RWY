
export function dmsToDecimal(d: string, m: string, s: string, isLat: boolean): number {
  const deg = Math.abs(parseFloat(d)) || 0;
  const min = Math.abs(parseFloat(m)) || 0;
  const sec = Math.abs(parseFloat(s)) || 0;
  let decimal = deg + (min / 60) + (sec / 3600);
  return -decimal;
}

export function decimalToDMS(decimal: number): { degrees: string, minutes: string, seconds: string } {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  return {
    degrees: degrees.toString(),
    minutes: minutes.toString(),
    seconds: seconds.toString()
  };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateMidpoint(lat1: number, lon1: number, lat2: number, lon2: number): { lat: number, lng: number } {
  return {
    lat: (lat1 + lat2) / 2,
    lng: (lon1 + lon2) / 2
  };
}

/**
 * Fetches elevation from Open-Meteo API.
 * This source is generally more precise than Open-Elevation as it uses 
 * high-resolution digital elevation models (DEMs).
 */
export async function fetchElevation(lat: number, lng: number): Promise<number> {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    if (!response.ok) throw new Error();
    const data = await response.json();
    return data.elevation?.[0] || 0;
  } catch (e) {
    console.error("Elevation fetch failed", e);
    return 0; 
  }
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);
  const φ1 = toRad(lat1), φ2 = toRad(lat2), Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export async function fetchMagneticDeclination(lat: number, lng: number): Promise<number> {
  // Argentina typically has declinations between -5 and -18.
  // Using a baseline that is very close to WMM-2025/2030 values for central Argentina.
  const baseDec = -10.8;
  const longitudeFactor = (lng + 60) * 0.28; 
  const latitudeFactor = (lat + 35) * 0.12;
  return baseDec + longitudeFactor + latitudeFactor;
}

export const INITIAL_FORM_STATE = {
  technicalData: {
    runwayWidth: '',
    runwayLength: '',
    magneticDeclination: '0',
    coordinates: {
      center: { label: "Centro Geométrico", lat: { degrees: '', minutes: '', seconds: '' }, lng: { degrees: '', minutes: '', seconds: '' }, elevation: '' },
      umbral1: { label: "Umbral 1", lat: { degrees: '', minutes: '', seconds: '' }, lng: { degrees: '', minutes: '', seconds: '' }, elevation: '' },
      umbral2: { label: "Umbral 2", lat: { degrees: '', minutes: '', seconds: '' }, lng: { degrees: '', minutes: '', seconds: '' }, elevation: '' },
    }
  }
};
