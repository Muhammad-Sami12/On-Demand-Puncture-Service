
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Plus, Minus, Crosshair, Wrench } from 'lucide-react';
import { GeoLocation, GroundedPlace } from '../types';

interface MapVisualProps {
  status?: 'idle' | 'searching' | 'tracking';
  myLocation?: GeoLocation;
  targetLocation?: GeoLocation;
  groundedPlaces?: GroundedPlace[];
}

export const MapVisual: React.FC<MapVisualProps> = ({ 
  status = 'idle', 
  myLocation, 
  targetLocation, 
  groundedPlaces = [] 
}) => {
  // Map internal state for visualization controls
  const [zoomLevel, setZoomLevel] = useState(15);
  const [centerLoc, setCenterLoc] = useState<GeoLocation | null>(null);
  const [mapUpdateKey, setMapUpdateKey] = useState(0);

  // Sync internal center with prop when it first arrives or on GPS reset
  useEffect(() => {
    if (myLocation && !centerLoc) {
      setCenterLoc(myLocation);
    }
  }, [myLocation]);

  const baseLat = centerLoc?.lat || myLocation?.lat || 24.8607;
  const baseLng = centerLoc?.lng || myLocation?.lng || 67.0011;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 1, 21));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };
  
  const handleResetGPS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (myLocation) {
      setCenterLoc(myLocation);
      setZoomLevel(15);
      setMapUpdateKey(prev => prev + 1);
    }
  };

  const getOffset = (loc?: GeoLocation) => {
    if (!myLocation || !loc) return { x: 0, y: 0 };
    // Scaling factor adjusted for map perspective
    const scale = Math.pow(2, zoomLevel - 15) * 45000;
    return {
      x: (loc.lng - myLocation.lng) * scale, 
      y: (loc.lat - myLocation.lat) * -scale
    };
  };

  const targetOffset = getOffset(targetLocation);
  const hasTarget = !!targetLocation && status === 'tracking';

  // Embed URL construction
  const mapUrl = `https://maps.google.com/maps?q=${baseLat},${baseLng}&z=${zoomLevel}&output=embed&t=m`;

  return (
    <div className="absolute inset-0 bg-slate-100 overflow-hidden z-0">
      {/* Background Interactive Map */}
      <iframe 
        key={`map-${mapUpdateKey}-${baseLat}-${baseLng}-${zoomLevel}`}
        src={mapUrl}
        className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      {/* Non-interactive Overlay for Markers */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Nearby Workshop Markers */}
        {groundedPlaces.map((place, idx) => {
          const offsetX = Math.cos(idx * 2) * 120;
          const offsetY = Math.sin(idx * 2) * 120;
          return (
            <div 
              key={idx}
              className="absolute top-1/2 left-1/2 transition-all duration-700"
              style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-brand-600 p-2 rounded-full shadow-lg border-2 border-white text-white scale-90">
                  <Wrench size={14} />
                </div>
                <div className="bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow text-[8px] font-black mt-1 whitespace-nowrap border border-slate-200 uppercase tracking-tighter">
                  {place.title.split(' ')[0]}
                </div>
              </div>
            </div>
          );
        })}

        {/* Technician Marker */}
        {hasTarget && (
          <div 
            className="absolute top-1/2 left-1/2 transition-all duration-1000 ease-linear"
            style={{ transform: `translate(${targetOffset.x}px, ${targetOffset.y}px)` }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/40 blur-lg rounded-full animate-pulse"></div>
                <div className="bg-white p-2 rounded-full shadow-xl border-2 border-green-500 relative">
                   <Navigation className="text-green-600 fill-green-600 rotate-45" size={20} />
                </div>
              </div>
              <div className="bg-green-600 text-white px-2 py-0.5 rounded shadow-lg text-[9px] font-black mt-1 uppercase tracking-widest">Tech</div>
            </div>
          </div>
        )}

        {/* User Marker (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className={`relative ${status === 'searching' ? 'animate-bounce' : ''}`}>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/20 blur-sm rounded-full"></div>
            <div className="relative">
              <div className="absolute -inset-2 bg-brand-500/20 blur-xl rounded-full opacity-60"></div>
              <MapPin className="text-brand-600 fill-brand-600 drop-shadow-xl relative" size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Controls - Moved to Top Right to avoid UI clash */}
      <div className="absolute right-4 top-24 flex flex-col gap-3 z-50 pointer-events-auto">
        <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <button 
            onClick={handleZoomIn} 
            className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-100 transition-colors border-b border-slate-100"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>
        
        <button 
          onClick={handleResetGPS} 
          className="w-11 h-11 bg-brand-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-brand-700 active:scale-90 transition-all border border-brand-500"
          title="Center GPS"
        >
          <Crosshair size={20} />
        </button>
      </div>

      {/* Mini Location Badge (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Live Signal</span>
            <span className="text-[10px] font-bold font-mono">
              {myLocation ? `${myLocation.lat.toFixed(5)}, ${myLocation.lng.toFixed(5)}` : 'LOCATING...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
