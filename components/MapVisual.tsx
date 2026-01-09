
import React, { useState } from 'react';
import { MapPin, Navigation, Plus, Minus, Crosshair, Wrench } from 'lucide-react';
import { GeoLocation, GroundedPlace } from '../types';

interface MapVisualProps {
  status?: 'idle' | 'searching' | 'tracking';
  myLocation?: GeoLocation;
  targetLocation?: GeoLocation;
  groundedPlaces?: GroundedPlace[];
}

export const MapVisual: React.FC<MapVisualProps> = ({ status = 'idle', myLocation, targetLocation, groundedPlaces = [] }) => {
  const [zoom, setZoom] = useState(1);
  
  const getOffset = (loc?: GeoLocation) => {
    if (!myLocation || !loc) return { x: 0, y: 0 };
    return {
      x: (loc.lng - myLocation.lng) * 25000, 
      y: (loc.lat - myLocation.lat) * -25000
    };
  };

  const targetOffset = getOffset(targetLocation);
  const hasTarget = !!targetLocation && status === 'tracking';

  return (
    <div className="absolute inset-0 bg-slate-100 overflow-hidden z-0">
      <div 
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Grounded Place Markers (Real shops from Google Maps) */}
        {groundedPlaces.map((place, idx) => (
          <div 
            key={idx}
            className="absolute top-1/2 left-1/2 transition-all duration-700"
            style={{ 
              transform: `translate(${(idx - 1) * 60}px, ${(idx % 2 === 0 ? 1 : -1) * 80}px) scale(${1/zoom})` 
            }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-full shadow-lg border border-brand-200 text-brand-600">
                <Wrench size={16} />
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[10px] font-bold mt-1 whitespace-nowrap">
                {place.title}
              </div>
            </div>
          </div>
        ))}

        {hasTarget && (
          <div 
            className="absolute top-1/2 left-1/2 transition-all duration-1000 ease-linear z-10"
            style={{ transform: `translate(${targetOffset.x}px, ${targetOffset.y}px) scale(${1/zoom})` }}
          >
            <div className="flex flex-col items-center">
              <Navigation className="text-green-600 fill-green-600 drop-shadow-lg rotate-45" size={32} />
              <div className="bg-white px-2 py-1 rounded-md shadow text-xs font-bold mt-1">En Route</div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
        <div className={`relative ${status === 'searching' ? 'animate-bounce' : ''}`}>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-xs rounded-full"></div>
          <MapPin className="text-brand-600 fill-brand-600 drop-shadow-lg" size={48} />
        </div>
      </div>

      <div className="absolute right-4 bottom-40 flex flex-col gap-2 z-20">
        <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center"><Plus size={20} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center"><Minus size={20} /></button>
        <button onClick={() => setZoom(1)} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-brand-600"><Crosshair size={20} /></button>
      </div>
    </div>
  );
};
