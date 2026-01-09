
import React, { useState, useEffect } from 'react';
import { Job, JobStatus, ServiceType, VehicleType, GeoLocation, GroundedPlace } from '../types';
import { SERVICE_ICONS, SERVICE_DESCRIPTIONS } from '../constants';
import { MapVisual } from './MapVisual';
import { findNearbyMechanics } from '../services/geminiService';
import { Star, Phone, MessageSquare, ChevronRight, CheckCircle, Bike, Car, ChevronLeft, Crosshair, MapPin, ExternalLink } from 'lucide-react';

interface CustomerViewProps {
  activeJob: Job | null;
  onCreateJob: (type: ServiceType, vehicle: VehicleType, lat: number, lng: number) => void;
  onCancelJob: () => void;
  onCompleteFlow: () => void;
  technicianLocation: GeoLocation;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ 
  activeJob, 
  onCreateJob, 
  onCancelJob, 
  onCompleteFlow,
  technicianLocation
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType>(ServiceType.TUBELESS_PLUG);
  const [myLocation, setMyLocation] = useState<GeoLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [addressText, setAddressText] = useState("Detecting location...");
  const [nearbyPlaces, setNearbyPlaces] = useState<GroundedPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const isSearching = activeJob?.status === JobStatus.SEARCHING;
  const isAssigned = activeJob && [JobStatus.ACCEPTED, JobStatus.ARRIVED, JobStatus.IN_PROGRESS].includes(activeJob.status);
  const isCompleted = activeJob?.status === JobStatus.COMPLETED;
  const mapStatus = isSearching ? 'searching' : (isAssigned ? 'tracking' : 'idle');

  useEffect(() => {
    if (!activeJob) detectLocation();
  }, []);

  useEffect(() => {
    if (isSearching && myLocation) {
      loadNearbyShops();
    }
  }, [isSearching]);

  const loadNearbyShops = async () => {
    if (!myLocation) return;
    setLoadingPlaces(true);
    const results = await findNearbyMechanics(myLocation);
    setNearbyPlaces(results);
    setLoadingPlaces(false);
  };

  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          setMyLocation(loc);
          setAddressText("Using GPS Location");
          setIsLocating(false);
        },
        () => {
          const loc = { lat: 31.5102, lng: 74.3441 };
          setMyLocation(loc);
          setAddressText("Liberty Market, Lahore");
          setIsLocating(false);
        }
      );
    }
  };

  const handleCreateJob = () => {
    if (myLocation && selectedVehicle) {
      onCreateJob(selectedService, selectedVehicle, myLocation.lat, myLocation.lng);
    }
  };

  if (isCompleted && activeJob) {
    return (
      <div className="h-full flex flex-col bg-white p-6 items-center justify-center text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold">Payment Complete</h2>
          <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2">
            <div className="flex justify-between"><span>Service</span><span className="font-bold">{activeJob.serviceType}</span></div>
            <div className="flex justify-between"><span>Amount</span><span className="font-bold text-brand-600">Rs. {activeJob.price}</span></div>
          </div>
          <button onClick={onCompleteFlow} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <MapVisual 
        status={mapStatus} 
        myLocation={myLocation || undefined}
        targetLocation={isAssigned ? technicianLocation : undefined}
        groundedPlaces={nearbyPlaces}
      />

      <div className="absolute top-0 left-0 w-full p-4 z-10 pt-6">
        <div className="bg-white/95 backdrop-blur shadow-md rounded-full px-4 py-2 flex items-center justify-between max-w-md mx-auto">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isLocating ? 'bg-yellow-500 animate-ping' : 'bg-brand-500'}`}></div>
             <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{addressText}</span>
           </div>
           <button onClick={detectLocation} className="text-slate-400 hover:text-brand-600"><Crosshair size={16}/></button>
        </div>
      </div>

      <div className="mt-auto z-20 w-full p-0 md:p-6">
        <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>

          {!activeJob ? (
            !selectedVehicle ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Request Assistance</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[VehicleType.BIKE, VehicleType.CAR].map(v => (
                    <button key={v} onClick={() => setSelectedVehicle(v)} className="p-6 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-brand-500 transition-all flex flex-col items-center">
                      <div className="mb-2">{v === VehicleType.BIKE ? <Bike size={32}/> : <Car size={32}/>}</div>
                      <span className="font-bold">{v}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedVehicle(null)}><ChevronLeft/></button>
                  <h2 className="text-xl font-bold">{selectedVehicle} Services</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ServiceType).map(t => (
                    <button key={t} onClick={() => setSelectedService(t)} className={`p-3 rounded-xl border-2 text-[10px] font-bold ${selectedService === t ? 'border-brand-500 bg-brand-50' : 'bg-white'}`}>
                      {SERVICE_ICONS[t]}<div className="mt-1">{t}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleCreateJob} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Request Now</button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {isSearching && (
                <div>
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <h3 className="font-bold">Locating Technicians...</h3>
                  </div>

                  {/* Real Results from Gemini Maps Grounding */}
                  <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nearby Mechanics Found</h4>
                    {loadingPlaces ? (
                      <div className="space-y-2">
                        <div className="h-12 bg-slate-100 animate-pulse rounded-lg"></div>
                        <div className="h-12 bg-slate-100 animate-pulse rounded-lg"></div>
                      </div>
                    ) : (
                      nearbyPlaces.map((place, i) => (
                        <a key={i} href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group">
                          <div className="bg-white p-2 rounded-lg group-hover:bg-brand-100"><MapPin size={16}/></div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-bold text-sm truncate">{place.title}</div>
                            {place.snippet && <div className="text-[10px] text-slate-500 truncate">{place.snippet}</div>}
                          </div>
                          <ExternalLink size={14} className="text-slate-300"/>
                        </a>
                      ))
                    )}
                  </div>
                  <button onClick={onCancelJob} className="w-full mt-6 text-red-500 text-sm font-bold">Cancel Request</button>
                </div>
              )}

              {isAssigned && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Technician En Route</h3>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-bold">Arriving in 8 mins</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <img src="https://i.pravatar.cc/100?u=tech" className="w-12 h-12 rounded-full border-2 border-white shadow" />
                    <div className="flex-1">
                      <div className="font-bold">Ali Khan</div>
                      <div className="text-xs text-yellow-600 flex items-center gap-1"><Star size={12} fill="currentColor"/> 4.9 (120 reviews)</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white rounded-full shadow-sm text-slate-600"><MessageSquare size={18}/></button>
                      <button className="p-2 bg-white rounded-full shadow-sm text-green-600"><Phone size={18}/></button>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-600 text-white p-4 rounded-2xl text-center">
                    <div className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Completion Code</div>
                    <div className="text-2xl font-mono font-bold tracking-[0.5em]">{activeJob.otp}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
