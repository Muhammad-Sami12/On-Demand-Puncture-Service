import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapVisualProps {
  status?: 'idle' | 'searching' | 'tracking';
  technicianLocation?: boolean;
}

export const MapVisual: React.FC<MapVisualProps> = ({ status = 'idle', technicianLocation }) => {
  return (
    <div className="absolute inset-0 bg-slate-100 overflow-hidden z-0">
      {/* SVG Map Background Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Mock Roads */}
        <path d="M -10 100 Q 150 300 400 200" stroke="white" strokeWidth="20" fill="none" />
        <path d="M -10 100 Q 150 300 400 200" stroke="#cbd5e1" strokeWidth="16" fill="none" />
        
        <path d="M 200 -10 L 200 900" stroke="white" strokeWidth="25" fill="none" />
        <path d="M 200 -10 L 200 900" stroke="#cbd5e1" strokeWidth="20" fill="none" />
      </svg>

      {/* User Pin (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
        <div className="relative">
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-xs rounded-full"></div>
          <MapPin className="text-brand-600 fill-brand-600 drop-shadow-lg" size={48} />
        </div>
        <div className="bg-white px-2 py-1 rounded-md shadow text-xs font-bold mt-1">You</div>
      </div>

      {/* Technician Pin (Animated) */}
      {technicianLocation && (
        <div className="absolute top-1/3 left-1/3 transition-all duration-[5000ms] ease-linear transform translate-x-10 translate-y-10">
          <div className="flex flex-col items-center">
            <Navigation className="text-green-600 fill-green-600 drop-shadow-lg rotate-45" size={32} />
            <div className="bg-white px-2 py-1 rounded-md shadow text-xs font-bold mt-1">Tech</div>
          </div>
        </div>
      )}

      {/* Pulse Effect for Searching */}
      {status === 'searching' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full animate-ping pointer-events-none"></div>
      )}
    </div>
  );
};