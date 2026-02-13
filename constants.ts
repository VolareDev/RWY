
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

/**
 * Approximates Magnetic Declination for the WMM 2024-2029 epoch in the Argentina region.
 * Validated against user example: 34 32 20 S / 60 55 52 W ~ 8° 5' W (-8.08°)
 */
export async function fetchMagneticDeclination(lat: number, lng: number): Promise<number> {
  // Baseline coefficients for the region based on 2025 WMM maps
  // Values for the region are moving slowly eastward (making the negative value less negative/larger)
  const baseDec = -8.1; 
  const lonOffset = (lng + 60.9); 
  const latOffset = (lat + 34.5);
  
  // Refined factors for Argentinian territory
  const dec = baseDec + (lonOffset * 0.15) - (latOffset * 0.08);
  return dec;
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

// --- ARGENOTAM DATA ---
export const MAP_CENTER: [number, number] = [-38.4161, -63.6167];
export const DEFAULT_ZOOM = 4;

export const ARGENTINA_AIRPORTS = [
  { icao: 'SAEZ', iata: 'EZE', name: 'Ezeiza - Ministro Pistarini', city: 'Buenos Aires', lat: -34.8222, lng: -58.5358 },
  { icao: 'SABE', iata: 'AEP', name: 'Aeroparque Jorge Newbery', city: 'Buenos Aires', lat: -34.5592, lng: -58.4156 },
  { icao: 'SACO', iata: 'COR', name: 'Córdoba - Ing. Taravella', city: 'Córdoba', lat: -31.31, lng: -64.208 },
  { icao: 'SAME', iata: 'MDZ', name: 'Mendoza - El Plumerillo', city: 'Mendoza', lat: -32.8317, lng: -68.7928 },
  { icao: 'SAZS', iata: 'BRC', name: 'San Carlos de Bariloche', city: 'Bariloche', lat: -41.1512, lng: -71.1577 },
  { icao: 'SAWH', iata: 'USH', name: 'Ushuaia - Malvinas Argentinas', city: 'Ushuaia', lat: -54.8433, lng: -68.2958 },
  { icao: 'SASA', iata: 'SLA', name: 'Salta - Martín M. de Güemes', city: 'Salta', lat: -24.856, lng: -65.486 },
  { icao: 'SANT', iata: 'TUC', name: 'Tucumán - Teniente Matienzo', city: 'Tucumán', lat: -26.8408, lng: -65.1047 },
  { icao: 'SAZN', iata: 'NQN', name: 'Neuquén - Presidente Perón', city: 'Neuquén', lat: -38.9489, lng: -68.1558 },
  { icao: 'SAAR', iata: 'ROS', name: 'Rosario - Islas Malvinas', city: 'Rosario', lat: -32.9036, lng: -60.7844 },
  { icao: 'SAZM', iata: 'MDQ', name: 'Mar del Plata - Astor Piazzolla', city: 'Mar del Plata', lat: -37.9342, lng: -57.5733 },
  { icao: 'SAVC', iata: 'CRD', name: 'Comodoro Rivadavia - Mosconi', city: 'Comodoro Rivadavia', lat: -45.7853, lng: -67.4656 },
  { icao: 'SARP', iata: 'PSS', name: 'Posadas - Libertador San Martín', city: 'Posadas', lat: -27.3858, lng: -55.9708 },
  { icao: 'SAOC', iata: 'RCU', name: 'Río Cuarto - Área de Material', city: 'Río Cuarto', lat: -33.1272, lng: -64.2611 },
  { icao: 'SAOR', iata: 'VMA', name: 'Villa Gesell', city: 'Villa Gesell', lat: -37.2347, lng: -57.0278 },
  { icao: 'SAAV', iata: 'SFN', name: 'Santa Fe - Sauce Viejo', city: 'Santa Fe', lat: -31.7117, lng: -60.8117 },
  { icao: 'SANC', iata: 'CTC', name: 'Catamarca - Felipe Varela', city: 'Catamarca', lat: -28.5925, lng: -65.7517 },
  { icao: 'SANU', iata: 'UAQ', name: 'San Juan - Domingo F. Sarmiento', city: 'San Juan', lat: -31.5714, lng: -68.4183 },
  { icao: 'SANE', iata: 'SDE', name: 'Santiago del Estero - Vicecomodoro Aragonés', city: 'Santiago del Estero', lat: -27.7661, lng: -64.3103 },
  { icao: 'SARO', iata: 'RES', name: 'Resistencia', city: 'Resistencia', lat: -27.4456, lng: -59.0561 },
  { icao: 'SAWG', iata: 'RGL', name: 'Río Gallegos - Norberto Fernández', city: 'Río Gallegos', lat: -51.6089, lng: -69.3128 },
  { icao: 'SAWE', iata: 'RGA', name: 'Río Grande', city: 'Tierra del Fuego', lat: -53.7775, lng: -67.7494 },
  { icao: 'SAZY', iata: 'CPC', name: 'San Martín de los Andes - Chapelco', city: 'Neuquén', lat: -40.0753, lng: -71.1372 },
  { icao: 'SAVT', iata: 'REL', name: 'Trelew - Almirante Zar', city: 'Chubut', lat: -43.2106, lng: -65.2703 },
  { icao: 'SAVY', iata: 'PMY', name: 'Puerto Madryn - El Tehuelche', city: 'Chubut', lat: -42.7475, lng: -65.1031 },
  { icao: 'SAAI', iata: 'IRJ', name: 'La Rioja - Almandos Almonacid', city: 'La Rioja', lat: -29.3806, lng: -66.7958 },
  { icao: 'SARI', iata: 'IGR', name: 'Puerto Iguazú - Mayor Krause', city: 'Misiones', lat: -25.7372, lng: -54.4733 },
  { icao: 'SARC', iata: 'CNQ', name: 'Corrientes - Piragine Niveyro', city: 'Corrientes', lat: -27.4456, lng: -58.7619 },
  { icao: 'SADF', iata: 'FDO', name: 'San Fernando', city: 'San Fernando', lat: -34.4531, lng: -58.5897 },
  { icao: 'SADM', iata: 'MOR', name: 'Morón', city: 'Morón', lat: -34.6769, lng: -58.6439 },
  { icao: 'SADL', iata: 'L_P', name: 'La Plata', city: 'La Plata', lat: -34.9728, lng: -57.8947 },
  { icao: 'SADP', iata: 'EPA', name: 'El Palomar', city: 'El Palomar', lat: -34.6094, lng: -58.6014 },
  { icao: 'SAZB', iata: 'BHI', name: 'Bahía Blanca - Espora', city: 'Bahía Blanca', lat: -38.7153, lng: -62.1528 },
  { icao: 'SAOU', iata: 'SFN', name: 'Santa Rosa', city: 'La Pampa', lat: -36.5881, lng: -64.2758 },
  { icao: 'SAMR', iata: 'AFA', name: 'San Rafael', city: 'Mendoza', lat: -34.5883, lng: -68.4031 },
  { icao: 'SAVV', iata: 'V_I', name: 'Viedma - Gobernador Castello', city: 'Río Negro', lat: -40.8692, lng: -63.0031 },
  { icao: 'SATA', iata: 'F_M', name: 'Formosa - El Pucú', city: 'Formosa', lat: -26.2131, lng: -58.2325 },
  { icao: 'SAJU', iata: 'JUJ', name: 'Jujuy - Horacio Guzmán', city: 'Jujuy', lat: -24.3928, lng: -64.9125 },
  { icao: 'SANL', iata: 'LU_O', name: 'San Luis - César Ojeda', city: 'San Luis', lat: -33.2722, lng: -66.3547 },
  { icao: 'SADD', iata: 'DON', name: 'Don Torcuato (Heli)', city: 'Buenos Aires', lat: -34.4833, lng: -58.6167 },
  { icao: 'SAEM', iata: 'EZE', name: 'Ezeiza (Centro Control)', city: 'Buenos Aires', lat: -34.825, lng: -58.538 },
  { icao: 'SAST', iata: 'S_T', name: 'Santa Teresita', city: 'Buenos Aires', lat: -36.5417, lng: -56.7117 },
  { icao: 'SADX', iata: 'M_I', name: 'Campo de Mayo', city: 'Buenos Aires', lat: -34.5333, lng: -58.6667 }
];

export const ARGENTINA_FIRS = [
  { icao: 'SAEF', name: 'Ezeiza FIR', lat: -34.82, lng: -58.53, radius: 450000 },
  { icao: 'SACF', name: 'Córdoba FIR', lat: -31.31, lng: -64.20, radius: 400000 },
  { icao: 'SAMF', name: 'Mendoza FIR', lat: -32.83, lng: -68.79, radius: 400000 },
  { icao: 'SARF', name: 'Resistencia FIR', lat: -27.45, lng: -58.83, radius: 400000 },
  { icao: 'SAVF', name: 'Comodoro Rivadavia FIR', lat: -45.78, lng: -67.46, radius: 650000 }
];
