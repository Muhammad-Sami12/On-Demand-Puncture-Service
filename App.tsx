
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Job, JobStatus, ServiceType, VehicleType, GeoLocation } from './types';
import { CustomerView } from './components/CustomerView';
import { TechnicianView } from './components/TechnicianView';
import { AdminView } from './components/AdminView';
import { Layout } from './components/Layout';
import { AlertCircle, User, Wrench, ShieldCheck } from 'lucide-react';

// Default to Karachi (Saddar area) if GPS fails
const KARACHI_FALLBACK: GeoLocation = { lat: 24.8607, lng: 67.0011 };

const App: React.FC = () => {
  // --- Global State ---
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isTechnicianOnline, setIsTechnicianOnline] = useState(true);
  
  // --- Real-time Location State ---
  const [userLocation, setUserLocation] = useState<GeoLocation>(KARACHI_FALLBACK);
  const [technicianLocation, setTechnicianLocation] = useState<GeoLocation>({ 
    lat: KARACHI_FALLBACK.lat + 0.005, 
    lng: KARACHI_FALLBACK.lng + 0.005 
  });

  // --- Geolocation Tracking ---
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLoc);
        console.log("GPS Updated:", newLoc);
      },
      (error) => {
        console.warn("GPS Error, using Karachi fallback:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const isTechnicianOnlineRef = useRef(isTechnicianOnline);
  useEffect(() => {
    isTechnicianOnlineRef.current = isTechnicianOnline;
  }, [isTechnicianOnline]);

  // --- Simulation: Move Technician towards Customer ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (activeJob && [JobStatus.ACCEPTED, JobStatus.ARRIVED, JobStatus.IN_PROGRESS].includes(activeJob.status)) {
      interval = setInterval(() => {
        setTechnicianLocation(prev => {
          const target = userLocation;
          const dx = target.lat - prev.lat;
          const dy = target.lng - prev.lng;
          const distance = Math.sqrt(dx*dx + dy*dy);

          if (distance < 0.0002) return prev;

          return {
            lat: prev.lat + (dx * 0.1),
            lng: prev.lng + (dy * 0.1)
          };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeJob, userLocation]);

  const [jobsHistory, setJobsHistory] = useState<Job[]>([]);

  const createJob = (serviceType: ServiceType, vehicleType: VehicleType, lat: number, lng: number) => {
    const newJob: Job = {
      id: `JOB-${Date.now().toString().slice(-6)}`,
      customerId: 'cust_123',
      technicianId: null,
      status: JobStatus.SEARCHING,
      serviceType,
      vehicleType,
      location: { lat, lng },
      createdAt: new Date(),
      price: calculatePrice(serviceType, vehicleType),
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
    };
    setActiveJob(newJob);
    setNotification({ title: "Requesting Help", message: "Broadcasting your GPS coordinates to Karachi techs..." });
    
    setTechnicianLocation({
      lat: lat + (Math.random() * 0.01 - 0.005),
      lng: lng + (Math.random() * 0.01 - 0.005)
    });

    setTimeout(() => {
      if (isTechnicianOnlineRef.current) {
        updateJobStatus(newJob.id, JobStatus.OFFERED);
      } else {
        setNotification({ title: "Unavailable", message: "No technicians active in your sector." });
        setActiveJob(null);
      }
    }, 3000);
  };

  const updateJobStatus = (jobId: string, status: JobStatus, extras?: Partial<Job>) => {
    setActiveJob(prev => {
      if (!prev || prev.id !== jobId) return prev;
      const updated = { ...prev, status, ...extras, updatedAt: new Date() };
      if (status === JobStatus.COMPLETED) {
        setJobsHistory(h => [updated, ...h]);
      }
      return updated;
    });
  };

  const calculatePrice = (service: ServiceType, vehicle: VehicleType) => {
    const multiplier = vehicle === VehicleType.BIKE ? 1 : 2.5;
    switch (service) {
      case ServiceType.TUBE_PATCH: return 250 * multiplier;
      case ServiceType.TUBELESS_PLUG: return 300 * multiplier;
      case ServiceType.TOW: return 1500 * multiplier;
      default: return 0;
    }
  };

  const renderRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.CUSTOMER: return <User size={16} />;
      case UserRole.TECHNICIAN: return <Wrench size={16} />;
      case UserRole.ADMIN: return <ShieldCheck size={16} />;
    }
  };

  return (
    <div className="font-sans text-slate-900">
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg rounded-full p-1 flex gap-1 border border-gray-200">
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(role)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${currentRole === role ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            {renderRoleIcon(role)}
            <span className="hidden sm:inline capitalize">{role}</span>
          </button>
        ))}
      </div>

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down w-full max-w-xs px-4">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-brand-400" />
            <div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-xs text-slate-300">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <Layout>
        {currentRole === UserRole.CUSTOMER && (
          <CustomerView 
            activeJob={activeJob} 
            onCreateJob={createJob} 
            onCancelJob={() => setActiveJob(null)}
            onCompleteFlow={() => setActiveJob(null)}
            technicianLocation={technicianLocation}
            userLocation={userLocation}
          />
        )}
        {currentRole === UserRole.TECHNICIAN && (
          <TechnicianView 
            activeJob={activeJob} 
            onUpdateStatus={updateJobStatus}
            isOnline={isTechnicianOnline}
            setIsOnline={setIsTechnicianOnline}
            technicianLocation={technicianLocation}
            setTechnicianLocation={setTechnicianLocation}
            customerLocation={userLocation}
          />
        )}
        {currentRole === UserRole.ADMIN && (
          <AdminView activeJob={activeJob} history={jobsHistory} />
        )}
      </Layout>
    </div>
  );
};

export default App;
