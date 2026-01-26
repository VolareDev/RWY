
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { PlaceType, GeolocationPoint } from './types';
import { 
  INITIAL_FORM_STATE, dmsToDecimal, decimalToDMS, calculateBearing, 
  fetchMagneticDeclination, calculateDistance, calculateMidpoint, fetchElevation 
} from './constants';
import MapPreview from './components/MapPreview';
import CoordinateInput from './components/CoordinateInput';

const App: React.FC = () => {
  const [formData, setFormData] = useState<any>(INITIAL_FORM_STATE);
  const [isFetching, setIsFetching] = useState(false);
  const calculationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateNestedState = useCallback((path: string, value: any) => {
    setFormData((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  }, []);

  const handleCoordChange = (pointKey: string, dmsKey: 'lat' | 'lng', field: 'degrees' | 'minutes' | 'seconds', val: string) => {
    setFormData((prev: any) => {
      const currentPoint = prev.technicalData.coordinates[pointKey];
      const updatedPoint = { ...currentPoint, [dmsKey]: { ...currentPoint[dmsKey], [field]: val } };
      const newState = JSON.parse(JSON.stringify(prev));
      newState.technicalData.coordinates[pointKey] = updatedPoint;
      return newState;
    });
  };

  const u1Coords = JSON.stringify(formData.technicalData.coordinates.umbral1);
  const u2Coords = JSON.stringify(formData.technicalData.coordinates.umbral2);
  const centerCoords = JSON.stringify(formData.technicalData.coordinates.center);

  // Unified effect for auto-calculating midpoint, distance, and fetching elevations/declination
  useEffect(() => {
    if (calculationTimeoutRef.current) clearTimeout(calculationTimeoutRef.current);

    calculationTimeoutRef.current = setTimeout(async () => {
      const { umbral1, umbral2, center } = formData.technicalData.coordinates;
      let newFormData = JSON.parse(JSON.stringify(formData));
      let changed = false;

      // 1. Calculate Midpoint and Distance if Umbrals exist
      if (umbral1.lat.degrees && umbral1.lng.degrees && umbral2.lat.degrees && umbral2.lng.degrees) {
        const lat1 = dmsToDecimal(umbral1.lat.degrees, umbral1.lat.minutes, umbral1.lat.seconds, true);
        const lon1 = dmsToDecimal(umbral1.lng.degrees, umbral1.lng.minutes, umbral1.lng.seconds, false);
        const lat2 = dmsToDecimal(umbral2.lat.degrees, umbral2.lat.minutes, umbral2.lat.seconds, true);
        const lon2 = dmsToDecimal(umbral2.lng.degrees, umbral2.lng.minutes, umbral2.lng.seconds, false);

        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        const mid = calculateMidpoint(lat1, lon1, lat2, lon2);
        
        newFormData.technicalData.runwayLength = distance.toFixed(0);
        newFormData.technicalData.coordinates.center.lat = decimalToDMS(mid.lat);
        newFormData.technicalData.coordinates.center.lng = decimalToDMS(mid.lng);
        changed = true;
      }

      // 2. Fetch Elevations for all active points
      const pointsToFetch = ['umbral1', 'umbral2', 'center'];
      setIsFetching(true);
      
      const updatedPoints = await Promise.all(pointsToFetch.map(async (key) => {
        const p = newFormData.technicalData.coordinates[key];
        if (p.lat.degrees && p.lng.degrees) {
          const lat = dmsToDecimal(p.lat.degrees, p.lat.minutes, p.lat.seconds, true);
          const lng = dmsToDecimal(p.lng.degrees, p.lng.minutes, p.lng.seconds, false);
          const elev = await fetchElevation(lat, lng);
          return { key, elev: elev.toFixed(1) };
        }
        return { key, elev: '' };
      }));

      updatedPoints.forEach(({ key, elev }) => {
        if (elev) {
          newFormData.technicalData.coordinates[key].elevation = elev;
          changed = true;
        }
      });

      // 3. Fetch Magnetic Declination for Center
      const c = newFormData.technicalData.coordinates.center;
      if (c.lat.degrees && c.lng.degrees) {
        const clat = dmsToDecimal(c.lat.degrees, c.lat.minutes, c.lat.seconds, true);
        const clng = dmsToDecimal(c.lng.degrees, c.lng.minutes, c.lng.seconds, false);
        const dec = await fetchMagneticDeclination(clat, clng);
        newFormData.technicalData.magneticDeclination = dec.toFixed(2);
        changed = true;
      }

      if (changed) {
        setFormData(newFormData);
      }
      setIsFetching(false);
    }, 1200);

    return () => { if (calculationTimeoutRef.current) clearTimeout(calculationTimeoutRef.current); };
  }, [u1Coords, u2Coords, centerCoords]);

  const activeMapPoints = useMemo(() => {
    const points: GeolocationPoint[] = [];
    const coords = formData.technicalData.coordinates;
    const { umbral1, umbral2, center } = coords;
    if (umbral1?.lat?.degrees) points.push(umbral1);
    if (umbral2?.lat?.degrees) points.push(umbral2);
    if (center?.lat?.degrees) points.push(center);
    return points;
  }, [formData.technicalData.coordinates]);

  const calculations = useMemo(() => {
    const tech = formData.technicalData;
    const { umbral1, umbral2 } = tech.coordinates;
    const declination = parseFloat(tech.magneticDeclination) || 0;

    if (!umbral1?.lat?.degrees || !umbral2?.lat?.degrees) return null;
    const lat1 = dmsToDecimal(umbral1.lat.degrees, umbral1.lat.minutes, umbral1.lat.seconds, true);
    const lon1 = dmsToDecimal(umbral1.lng.degrees, umbral1.lng.minutes, umbral1.lng.seconds, false);
    const lat2 = dmsToDecimal(umbral2.lat.degrees, umbral2.lat.minutes, umbral2.lat.seconds, true);
    const lon2 = dmsToDecimal(umbral2.lng.degrees, umbral2.lng.minutes, umbral2.lng.seconds, false);
    
    // Direction 1: U1 -> U2
    const trueBrng1 = calculateBearing(lat1, lon1, lat2, lon2);
    const magBrng1 = (trueBrng1 - declination + 360) % 360;
    
    // Direction 2: U2 -> U1
    const trueBrng2 = (trueBrng1 + 180) % 360;
    const magBrng2 = (trueBrng2 - declination + 360) % 360;

    const formatDesignator = (num: number) => {
      let n = Math.round(num / 10);
      if (n === 0) n = 36;
      if (n > 36) n -= 36;
      return n.toString().padStart(2, '0');
    };
    
    const designator = `${formatDesignator(magBrng1)}/${formatDesignator(magBrng2)}`;
    return { trueBrng1, trueBrng2, designator };
  }, [formData.technicalData.coordinates, formData.technicalData.magneticDeclination]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-white shadow-2xl min-h-screen my-4 md:my-10 rounded-none md:rounded-[2.5rem] border border-slate-100 overflow-hidden">
      <header className="flex flex-col items-center justify-center border-b border-slate-100 pb-8 gap-2">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">Rumbos de RWY</h1>
        <p className="text-blue-600 font-bold tracking-widest uppercase text-xs">Herramienta de Cálculo Aeronáutico</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border-2 border-blue-100 shadow-sm">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Ancho (m) *</label>
              <input 
                type="number" 
                placeholder="0.0" 
                value={formData.technicalData.runwayWidth} 
                onChange={(e) => updateNestedState('technicalData.runwayWidth', e.target.value)} 
                className="w-full text-2xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-blue-100 focus:border-blue-600"
              />
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Largo (m)</label>
              <div className="text-2xl font-black text-slate-800">{formData.technicalData.runwayLength || '--'} m</div>
            </div>
          </div>

          {/* Umbrales and Center */}
          {(['umbral1', 'umbral2', 'center'] as const).map((key) => {
            const p = formData.technicalData.coordinates[key];
            const isCenter = key === 'center';
            return (
              <div key={key} className={`p-8 rounded-[2.5rem] border-2 space-y-8 shadow-sm transition-all ${isCenter ? 'bg-blue-50/20 border-blue-100' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-black text-sm uppercase tracking-widest ${isCenter ? 'text-blue-900' : 'text-slate-800'}`}>{p.label}</h3>
                  <div className="text-right">
                    <label className={`text-[10px] font-black uppercase ${isCenter ? 'text-blue-800' : 'text-slate-400'}`}>Elevación (m)</label>
                    <div className={`text-lg font-black ${isCenter ? 'text-blue-900' : 'text-blue-600'}`}>{p.elevation || '--'} m</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <CoordinateInput 
                    label="Latitud" 
                    disabled={isCenter}
                    value={p.lat} 
                    onChange={(f, v) => handleCoordChange(key, 'lat', f as any, v)} 
                    suffix="S" 
                  />
                  <CoordinateInput 
                    label="Longitud" 
                    disabled={isCenter}
                    value={p.lng} 
                    onChange={(f, v) => handleCoordChange(key, 'lng', f as any, v)} 
                    suffix="W" 
                  />
                </div>
              </div>
            );
          })}

          {/* RESULTS */}
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border-8 border-slate-800">
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                 <div>
                   <div className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Declinación Magnética</div>
                   <div className="text-3xl font-black">{formData.technicalData.magneticDeclination}°</div>
                 </div>
                 <div className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">SISTEMA WMM-NOAA</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rumbos Verdaderos</div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="text-[10px] font-bold text-slate-400">U1 → U2:</span>
                          <span className="text-xl font-mono font-black">{calculations?.trueBrng1?.toFixed(1) || '000.0'}°</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="text-[10px] font-bold text-slate-400">U2 → U1:</span>
                          <span className="text-xl font-mono font-black">{calculations?.trueBrng2?.toFixed(1) || '000.0'}°</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right flex flex-col justify-end">
                    <div className="text-[10px] font-black text-green-400 uppercase mb-2">Pista (Designación)</div>
                    <div className="text-5xl font-black text-green-400 tracking-tighter">{calculations?.designator || '--/--'}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP SECTION */}
        <div className="relative h-full">
          <div className="sticky top-10 h-full">
            <div className="bg-white border-4 border-slate-50 p-6 rounded-[3rem] shadow-2xl flex flex-col h-[750px]">
              <div className="flex-1 bg-slate-100 rounded-[2rem] overflow-hidden">
                <MapPreview points={activeMapPoints} type={PlaceType.LAD} numTraj={1} />
              </div>
              <div className="mt-8 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Coordenadas de Referencia</p>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-40 p-1">
                  {activeMapPoints.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] font-mono">
                      <span className="font-black text-slate-400 uppercase bg-white px-2 py-0.5 rounded shadow-sm">{p?.label}</span>
                      <span className="text-slate-700">{p?.lat?.degrees}°{p?.lat?.minutes}'{p?.lat?.seconds}"S / {p?.lng?.degrees}°{p?.lng?.minutes}'{p?.lng?.seconds}"W</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-12 border-t border-slate-100 flex flex-col items-center text-center">
        <div className="text-sm font-bold text-slate-400">
          Desarrollado por Daniel Montoto - 2026 - Derechos Reservados. Prohibido su uso no autorizado.{" "}
          Contacto:{" "}
          <a
            href="https://bit.ly/WhappDM"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            https://bit.ly/WhappDM
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
