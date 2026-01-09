
import React, { useState, useEffect } from 'react';
import { Job, JobStatus, ServiceType, VehicleType, GeoLocation, GroundedPlace } from '../types';
import { SERVICE_ICONS } from '../constants';
import { MapVisual } from './MapVisual';
import { findNearbyMechanics } from '../services/geminiService';
import { Star, Phone, ChevronRight, CheckCircle, Bike, Car, ChevronLeft, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface CustomerViewProps {
  activeJob: Job | null;
  onCreateJob: (type: ServiceType, vehicle: VehicleType, lat: number, lng: number) => void;
  onCancelJob: () => void;
  onCompleteFlow: () => void;
  technicianLocation: GeoLocation;
  userLocation: GeoLocation;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ 
  activeJob, 
  onCreateJob, 
  onCancelJob, 
  onCompleteFlow,
  technicianLocation,
  userLocation
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType>(ServiceType.TUBELESS_PLUG);
  const [nearbyPlaces, setNearbyPlaces] = useState<GroundedPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const isSearching = activeJob?.status === JobStatus.SEARCHING;
  const isAssigned = activeJob && [JobStatus.ACCEPTED, JobStatus.ARRIVED, JobStatus.IN_PROGRESS].includes(activeJob.status);
  const isCompleted = activeJob?.status === JobStatus.COMPLETED;
  const mapStatus = isSearching ? 'searching' : (isAssigned ? 'tracking' : 'idle');

  useEffect(() => {
    if (isSearching && userLocation) {
      loadNearbyShops();
    }
  }, [isSearching, userLocation]);

  const loadNearbyShops = async () => {
    setLoadingPlaces(true);
    const results = await findNearbyMechanics(userLocation);
    setNearbyPlaces(results);
    setLoadingPlaces(false);
  };

  const handleCreateJob = () => {
    if (selectedVehicle) {
      onCreateJob(selectedService, selectedVehicle, userLocation.lat, userLocation.lng);
    }
  };

  if (isCompleted && activeJob) {
    return (
      <div className="h-full flex flex-col bg-white p-8 items-center justify-center text-center animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-inner border-4 border-white">
            <CheckCircle size={56} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Job Complete</h2>
            <p className="text-slate-500 font-medium">Verified repair successful. Safety first!</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Service</span><span className="text-slate-800">{activeJob.serviceType}</span></div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Paid</span><span className="font-black text-2xl text-brand-600">Rs. {activeJob.price}</span></div>
          </div>
          <button onClick={onCompleteFlow} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-slate-100">
      <MapVisual 
        status={mapStatus} 
        myLocation={userLocation}
        targetLocation={isAssigned ? technicianLocation : undefined}
        groundedPlaces={nearbyPlaces}
      />

      {/* Status Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 pt-6 pointer-events-none">
        <div className="bg-white/95 backdrop-blur shadow-2xl rounded-full px-5 py-3 flex items-center justify-between max-w-sm mx-auto border border-white pointer-events-auto">
           <div className="flex items-center gap-3">
             <div className="relative flex items-center justify-center">
               <div className="absolute inset-0 bg-brand-500/20 animate-ping rounded-full w-4 h-4"></div>
               <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white relative"></div>
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] leading-none mb-1">Active Sector</span>
               <span className="text-xs font-bold text-slate-800 leading-none">Karachi Region</span>
             </div>
           </div>
           <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-brand-600">
             <ShieldCheck size={16}/>
           </div>
        </div>
      </div>

      {/* Main UI Sheet */}
      <div className="mt-auto z-30 w-full p-0 md:p-6 pointer-events-none">
        <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)] p-6 md:p-8 max-w-md mx-auto border-t border-slate-100 relative overflow-hidden pointer-events-auto transition-transform duration-500 ease-out">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>

          {!activeJob ? (
            !selectedVehicle ? (
              <div className="space-y-8 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Puncture Pro</h2>
                  <span className="text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full uppercase tracking-widest">24/7 Rescue</span>
                </div>
                
                <div className="flex gap-4">
                  {[VehicleType.BIKE, VehicleType.CAR].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setSelectedVehicle(v)} 
                      className="flex-1 py-10 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-brand-500 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col items-center group relative overflow-hidden active:scale-95"
                    >
                      <div className="mb-4 text-slate-400 group-hover:text-brand-600 group-hover:scale-125 transition-all duration-500">
                        {v === VehicleType.BIKE ? <Bike size={44}/> : <Car size={44}/>}
                      </div>
                      <span className="font-black text-slate-900 tracking-tight text-xl">{v}</span>
                      <span className="text-[10px] text-brand-600 font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 text-slate-500 justify-center py-4 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <MapPin size={18} className="text-brand-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Detected Karachi South</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-slide-up">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedVehicle(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><ChevronLeft size={24} className="text-slate-900"/></button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none">{selectedVehicle}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Select Service Level</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(ServiceType).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedService(t)} 
                      className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedService === t ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xl scale-[1.05]' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                    >
                      <div className={`mb-3 p-2.5 rounded-2xl ${selectedService === t ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        {SERVICE_ICONS[t]}
                      </div>
                      <div className="text-[9px] font-black uppercase text-center leading-tight tracking-tighter">{t}</div>
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl mt-4 border border-slate-800">
                   <div>
                     <p className="text-[9px] font-black text-brand-400 uppercase tracking-[0.3em] mb-1">Estimated Fare</p>
                     <p className="text-3xl font-black">Rs. {selectedVehicle === VehicleType.BIKE ? (selectedService === ServiceType.TOW ? 1500 : 250) : (selectedService === ServiceType.TOW ? 3000 : 550)}</p>
                   </div>
                   <button onClick={handleCreateJob} className="bg-brand-600 p-5 rounded-3xl hover:bg-brand-500 transition-all shadow-xl active:scale-90">
                      <ChevronRight size={32} />
                   </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {isSearching && (
                <div className="animate-fade-in">
                  <div className="text-center py-8">
                    <div className="relative inline-block mb-6">
                      <div className="animate-ping absolute inset-0 bg-brand-500/20 rounded-full scale-[2]"></div>
                      <div className="w-20 h-20 border-t-4 border-brand-600 border-r-4 border-r-transparent border-l-4 border-l-transparent rounded-full mx-auto animate-spin flex items-center justify-center relative z-10">
                        <div className="w-10 h-10 bg-brand-600 rounded-full shadow-lg"></div>
                      </div>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900">Locating Technicians</h3>
                    <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Broadcasting coordinates...</p>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nearby Shops</h4>
                       <span className="text-[8px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">AI ASSIST</span>
                    </div>
                    {loadingPlaces ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-3xl border border-slate-100"></div>)}
                      </div>
                    ) : nearbyPlaces.length > 0 ? (
                      nearbyPlaces.map((place, i) => (
                        <a key={i} href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-brand-100 group">
                          <div className="bg-white p-4 rounded-2xl shadow-sm text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all"><MapPin size={22}/></div>
                          <div className="flex-1 overflow-hidden text-left">
                            <div className="font-black text-base text-slate-800 truncate">{place.title}</div>
                            <div className="text-[11px] text-slate-500 truncate mt-1 font-bold">{place.snippet || 'Sector Verified'}</div>
                          </div>
                          <ExternalLink size={18} className="text-slate-300 group-hover:text-brand-500"/>
                        </a>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                         <p className="text-[11px] text-slate-400 font-black uppercase italic tracking-widest animate-pulse">Scanning Secure Channels...</p>
                      </div>
                    )}
                  </div>
                  <button onClick={onCancelJob} className="w-full mt-8 py-4 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-50 rounded-3xl transition-colors active:scale-[0.98]">Cancel Rescue</button>
                </div>
              )}

              {isAssigned && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-3xl text-slate-900 tracking-tighter">En Route</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Arrival: 8-12 mins</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl text-[11px] font-black tracking-widest shadow-sm animate-pulse border border-green-200">GPS LIVE</div>
                  </div>
                  
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <div className="relative">
                      <img src="https://i.pravatar.cc/120?u=tech_ali" className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-2xl object-cover" />
                      <div className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1.5 rounded-xl border-2 border-white shadow-xl">
                        <CheckCircle size={14}/>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-xl text-slate-900 leading-none">Ali Haider</div>
                      <div className="text-xs text-yellow-600 flex items-center gap-1.5 font-black mt-3 bg-white w-fit px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                        <Star size={14} fill="currentColor"/> 4.9
                      </div>
                    </div>
                    <button className="p-5 bg-white rounded-2xl shadow-xl text-green-600 hover:scale-110 active:scale-95 transition-all border border-slate-100">
                      <Phone size={24}/>
                    </button>
                  </div>
                  
                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center mb-4">Share PIN upon Arrival</p>
                    <div className="text-6xl font-black text-center tracking-[0.4em] drop-shadow-2xl">{activeJob.otp}</div>
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
