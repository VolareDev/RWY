
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FIR } from '../types';

const radarIcon = (isSelected: boolean) => L.divIcon({
  html: `<div class="relative flex items-center justify-center w-12 h-12">
    <!-- Outer static ring -->
    <div class="absolute w-full h-full rounded-full border border-blue-500/30"></div>
    <!-- Sweeping radar effect -->
    <div class="absolute w-full h-full rounded-full bg-gradient-to-tr from-blue-500/40 via-transparent to-transparent animate-[spin_4s_linear_infinite]"></div>
    <!-- Center Point -->
    <div class="z-10 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400 scale-125' : 'bg-slate-400'} shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all"></div>
    ${isSelected ? '<div class="absolute w-full h-full rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>' : ''}
  </div>`,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

interface FIRMarkerProps {
  fir: FIR;
  isSelected: boolean;
  onClick: (f: FIR) => void;
}

const FIRMarker: React.FC<FIRMarkerProps> = ({ fir, isSelected, onClick }) => {
  return (
    <Marker
      position={[fir.lat, fir.lng]}
      icon={radarIcon(isSelected)}
      eventHandlers={{ click: () => onClick(fir) }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-black text-sm uppercase text-white">{fir.name}</h3>
          <p className="text-[10px] text-slate-300">Región de Información de Vuelo (FIR)</p>
          <p className="text-[9px] font-mono text-blue-400 mt-1 uppercase tracking-widest">{fir.icao}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default FIRMarker;
