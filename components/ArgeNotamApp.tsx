
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import Sidebar from './Sidebar';
import AirportMarker from './AirportMarker';
import FIRMarker from './FIRMarker';
import { ARGENTINA_AIRPORTS, ARGENTINA_FIRS, MAP_CENTER, DEFAULT_ZOOM } from '../constants';
import { Airport, FIR, Notam, GroundingSource, LocationType } from '../types';
import { fetchNotams } from '../services/geminiService';

const MapResizeHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Ensuring map takes full container size on mount and after layout shifts
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};

const MapFlyTo: React.FC<{ coords: [number, number] | null }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 10, {
        animate: true,
        duration: 1.5
      });
    }
  }, [coords, map]);
  return null;
};

const ArgeNotamApp: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState<{ type: LocationType, id: string } | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [notams, setNotams] = useState<Notam[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [airports, setAirports] = useState<Airport[]>(ARGENTINA_AIRPORTS);
  const [search, setSearch] = useState('');

  const searchResults = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    
    const matchedAirports = airports.filter(a => 
      a.icao.toLowerCase().includes(lower) || 
      (a.iata && a.iata.toLowerCase().includes(lower)) || 
      a.name.toLowerCase().includes(lower) ||
      a.city.toLowerCase().includes(lower)
    ).map(a => ({ type: 'AIRPORT' as LocationType, data: a }));

    const matchedFirs = ARGENTINA_FIRS.filter(f => 
      f.name.toLowerCase().includes(lower) || 
      f.icao.toLowerCase().includes(lower)
    ).map(f => ({ type: 'FIR' as LocationType, data: f }));

    const globalMatch = 'todos los fir argentina nacional global'.includes(lower) ? [{ type: 'GLOBAL' as LocationType, data: 'GLOBAL' as any }] : [];

    return [...globalMatch, ...matchedFirs, ...matchedAirports].slice(0, 8);
  }, [search, airports]);

  const handleSelect = useCallback(async (type: LocationType, item: Airport | FIR | 'GLOBAL') => {
    setIsLoading(true);
    setNotams([]);
    setSources([]);
    setSearch('');

    if (type === 'GLOBAL') {
      setSelectedLoc({ type: 'GLOBAL', id: 'ALL' });
      setSelectedName("Avisos Nacionales");
      setFlyToCoords(null);
      const data = await fetchNotams("Argentina National", 'GLOBAL');
      setNotams(data.notams);
      setSources(data.sources);
    } else if (type === 'AIRPORT') {
      const airport = item as Airport;
      setSelectedLoc({ type: 'AIRPORT', id: airport.icao });
      setSelectedName(airport.name);
      setFlyToCoords([airport.lat, airport.lng]);
      const data = await fetchNotams(airport.icao, 'AIRPORT');
      setNotams(data.notams);
      setSources(data.sources);
      setAirports(prev => prev.map(a => a.icao === airport.icao ? { ...a, isClosed: data.isClosed } : a));
    } else {
      const fir = item as FIR;
      setSelectedLoc({ type: 'FIR', id: fir.icao });
      setSelectedName(fir.name);
      setFlyToCoords([fir.lat, fir.lng]);
      const data = await fetchNotams(fir.icao, 'FIR');
      setNotams(data.notams);
      setSources(data.sources);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 overflow-hidden relative">
      
      {/* Search Bar Floating */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[3000] w-[90%] md:w-80">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar OACI (SABE, SAEZ...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700 last:border-0 transition-colors flex flex-col"
                  onClick={() => handleSelect(result.type, result.data as any)}
                >
                  <span className="font-black text-[11px] text-white uppercase tracking-wider">
                    {result.type === 'GLOBAL' ? 'ARGENTINA' : (result.data as any).icao}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold truncate">{(result.data as any).name || 'Avisos Nacionales'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="order-2 md:order-1 flex-none h-[45%] md:h-full">
        <Sidebar 
          selectedLocation={selectedLoc}
          selectedName={selectedName}
          onSelect={handleSelect}
          notams={notams}
          sources={sources}
          isLoading={isLoading}
        />
      </div>
      
      <div className="order-1 md:order-2 flex-1 relative h-[55%] md:h-full">
        <MapContainer 
          center={MAP_CENTER} 
          zoom={DEFAULT_ZOOM} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <MapResizeHandler />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          
          {ARGENTINA_FIRS.map(fir => (
            <FIRMarker 
              key={fir.icao}
              fir={fir}
              isSelected={selectedLoc?.type === 'FIR' && selectedLoc.id === fir.icao}
              onClick={(f) => handleSelect('FIR', f)}
            />
          ))}

          {airports.map((airport) => (
            <AirportMarker 
              key={airport.icao} 
              airport={airport} 
              isSelected={selectedLoc?.type === 'AIRPORT' && selectedLoc.id === airport.icao}
              onClick={(a) => handleSelect('AIRPORT', a)}
            />
          ))}

          <MapFlyTo coords={flyToCoords} />
        </MapContainer>

        {/* Global Action Button (Floating Desktop) */}
        <button 
          onClick={() => handleSelect('GLOBAL', 'GLOBAL')}
          className="absolute bottom-8 right-8 z-[1000] hidden md:flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-blue-400/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
          Avisos Nacionales
        </button>
      </div>
    </div>
  );
};

export default ArgeNotamApp;
