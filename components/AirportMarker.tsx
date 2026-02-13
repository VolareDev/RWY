
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Airport } from '../types';

const airportIcon = (isClosed?: boolean) => L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 ${isClosed ? 'bg-red-500 border-red-300' : 'bg-blue-600 border-blue-300'} shadow-lg transform transition-transform hover:scale-125">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"/></svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface AirportMarkerProps {
  airport: Airport;
  isSelected: boolean;
  onClick: (a: Airport) => void;
}

const AirportMarker: React.FC<AirportMarkerProps> = ({ airport, isSelected, onClick }) => {
  return (
    <Marker 
      position={[airport.lat, airport.lng]} 
      icon={airportIcon(airport.isClosed)}
      eventHandlers={{ click: () => onClick(airport) }}
    >
      <Popup className="custom-popup">
        <div className="p-1">
          <h3 className="font-black text-sm uppercase">{airport.icao}</h3>
          <p className="text-[10px] text-slate-300">{airport.name}</p>
          {airport.isClosed && <p className="mt-2 text-[10px] font-black text-red-400 uppercase tracking-widest">CERRADO</p>}
        </div>
      </Popup>
    </Marker>
  );
};

export default AirportMarker;
