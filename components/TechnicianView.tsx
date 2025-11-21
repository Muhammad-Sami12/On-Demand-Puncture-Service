
import React, { useState, useRef } from 'react';
import { Job, JobStatus, PhotoAnalysisResult, VehicleType } from '../types';
import { analyzeTirePhoto } from '../services/geminiService';
import { Navigation, MapPin, Camera, Check, X, Loader2, Clock, Bike, Car } from 'lucide-react';
import { MapVisual } from './MapVisual';

interface TechnicianViewProps {
  activeJob: Job | null;
  onUpdateStatus: (jobId: string, status: JobStatus, extras?: Partial<Job>) => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({ activeJob, onUpdateStatus }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleAccept = () => {
    if (activeJob) onUpdateStatus(activeJob.id, JobStatus.ACCEPTED);
  };

  const handleArrive = () => {
    if (activeJob) onUpdateStatus(activeJob.id, JobStatus.ARRIVED);
  };

  const handleStart = () => {
    if (activeJob) onUpdateStatus(activeJob.id, JobStatus.IN_PROGRESS);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Strip prefix for API if needed, but generateContent inlineData handles data URL usually or needs raw base64
      // GoogleGenAI expects just the base64 data part usually
      const base64Data = base64.split(',')[1];
      
      const result = await analyzeTirePhoto(base64Data);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    if (!activeJob) return;
    if (otpInput === activeJob.otp) {
       onUpdateStatus(activeJob.id, JobStatus.COMPLETED);
       setOtpInput('');
       setAnalysisResult(null);
    } else {
      alert("Incorrect OTP");
    }
  };

  // --- Views ---

  if (!activeJob) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${isOnline ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
          <Navigation size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {isOnline ? "You are Online" : "You are Offline"}
        </h2>
        <p className="text-slate-500 text-center mb-8 max-w-xs">
          {isOnline 
            ? "Waiting for job requests in your area..." 
            : "Go online to start receiving puncture repair jobs."}
        </p>
        
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`
            px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95
            ${isOnline ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-700'}
          `}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>
    );
  }

  // Incoming Job Offer
  if (activeJob.status === JobStatus.OFFERED) {
    return (
      <div className="h-full flex flex-col relative">
        <MapVisual status="idle" />
        <div className="absolute inset-x-4 bottom-8 bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
             <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="bg-brand-100 text-brand-700 p-1 rounded-md">
                    {activeJob.vehicleType === VehicleType.BIKE ? <Bike size={16}/> : <Car size={16}/>}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">New Request</h3>
               </div>
               <p className="text-slate-500 text-sm">{activeJob.serviceType} ({activeJob.vehicleType})</p>
             </div>
             <div className="text-right">
               <span className="block text-2xl font-bold text-slate-900">Rs. {activeJob.price}</span>
               <span className="text-xs text-slate-400">Est. Earnings</span>
             </div>
          </div>
          <div className="flex gap-2 text-sm text-slate-600 mb-6">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={14}/> 12 min</span>
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><MapPin size={14}/> 3.2 km</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 rounded-xl font-bold text-slate-600 bg-slate-100" onClick={() => onUpdateStatus(activeJob.id, JobStatus.SEARCHING)}>Decline</button>
            <button className="py-3 rounded-xl font-bold text-white bg-brand-600 shadow-lg shadow-brand-200" onClick={handleAccept}>Accept</button>
          </div>
        </div>
      </div>
    );
  }

  // Active Job Workflow
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <span className="bg-white/20 p-1 rounded">
                {activeJob.vehicleType === VehicleType.BIKE ? <Bike size={14}/> : <Car size={14}/>}
             </span>
             <h2 className="font-bold text-lg">Job #{activeJob.id.split('-')[1]}</h2>
          </div>
          <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono uppercase">{activeJob.status.replace('_', ' ')}</span>
        </div>
        {/* Timeline Steps */}
        <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-700 -z-0"></div>
            {[JobStatus.ACCEPTED, JobStatus.ARRIVED, JobStatus.IN_PROGRESS].map((step, idx) => (
              <div key={step} className={`w-4 h-4 rounded-full border-2 z-10 ${activeJob.status === step ? 'bg-brand-500 border-brand-500' : 'bg-slate-800 border-slate-600'}`}></div>
            ))}
        </div>
      </div>

      <div className="flex-1 -mt-6 bg-white rounded-t-3xl p-6 flex flex-col overflow-y-auto">
        
        {activeJob.status === JobStatus.ACCEPTED && (
           <div className="text-center space-y-6 mt-10">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
               <Navigation size={40} />
             </div>
             <h3 className="text-xl font-bold">Navigate to Pickup</h3>
             <p className="text-slate-500">Customer is waiting at marked location.</p>
             <button onClick={handleArrive} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg">Arrived at Location</button>
           </div>
        )}

        {activeJob.status === JobStatus.ARRIVED && (
          <div className="text-center space-y-6 mt-10">
             <h3 className="text-xl font-bold">Start Job</h3>
             <p className="text-slate-500">Verify customer and vehicle before starting.</p>
             <button onClick={handleStart} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg">Start Work</button>
          </div>
        )}

        {activeJob.status === JobStatus.IN_PROGRESS && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Work Verification</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
               <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               />
               <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Camera size={24} />
                  </div>
                  <p className="font-medium text-slate-700">Upload After-Work Photo</p>
                  <p className="text-xs text-slate-400">AI checks for brightness & blur</p>
               </div>
            </div>

            {isAnalyzing && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">AI analyzing image quality...</span>
              </div>
            )}

            {analysisResult && (
              <div className={`p-4 rounded-xl border ${analysisResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                 <div className="flex items-center gap-2 mb-2">
                    {analysisResult.isValid ? <Check className="text-green-600" size={20}/> : <X className="text-red-600" size={20}/>}
                    <h4 className={`font-bold ${analysisResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {analysisResult.isValid ? "Photo Verified" : "Photo Rejected"}
                    </h4>
                 </div>
                 <p className="text-sm text-slate-700 mb-2">{analysisResult.feedback}</p>
                 <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-white/50 rounded border">Brightness: {analysisResult.brightness}</span>
                    <span className="px-2 py-1 bg-white/50 rounded border">Blur: {analysisResult.blur}</span>
                 </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Customer OTP</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter 4-digit code"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="flex-1 p-3 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button 
                  disabled={!analysisResult?.isValid || otpInput.length !== 4}
                  onClick={handleComplete}
                  className="bg-slate-900 text-white px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">OTP is required to close the job.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
