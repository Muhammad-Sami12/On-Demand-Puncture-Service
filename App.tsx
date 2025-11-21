
import React, { useState, useEffect } from 'react';
import { UserRole, Job, JobStatus, ServiceType, VehicleType } from './types';
import { CustomerView } from './components/CustomerView';
import { TechnicianView } from './components/TechnicianView';
import { AdminView } from './components/AdminView';
import { Layout } from './components/Layout';
import { AlertCircle, User, Wrench, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // --- Global State ---
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  // --- Mock Data Store ---
  // In a real app, this would be Firestore
  const [jobsHistory, setJobsHistory] = useState<Job[]>([]);

  // --- Handlers ---

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
      otp: Math.floor(1000 + Math.random() * 9000).toString(), // 4 digit OTP
    };
    setActiveJob(newJob);
    setNotification({ title: "Request Sent", message: "Searching for nearby technicians..." });
    
    // Simulate finding a tech after 3 seconds
    setTimeout(() => {
      if (newJob.status === JobStatus.SEARCHING) {
        updateJobStatus(newJob.id, JobStatus.OFFERED);
        // Mocking the push notification to technician
        // In a real app, this happens via FCM
      }
    }, 3000);
  };

  const updateJobStatus = (jobId: string, status: JobStatus, extras?: Partial<Job>) => {
    setActiveJob(prev => {
      if (!prev || prev.id !== jobId) return prev;
      const updated = { ...prev, status, ...extras, updatedAt: new Date() };
      
      if (status === JobStatus.COMPLETED) {
        setJobsHistory(h => [updated, ...h]);
        // Clear active job for customer after a delay or manual close
        // For now, we keep it to show receipt
      }
      return updated;
    });
  };

  const calculatePrice = (service: ServiceType, vehicle: VehicleType) => {
    // Pricing in PKR
    if (vehicle === VehicleType.BIKE) {
      switch (service) {
        case ServiceType.TUBE_PATCH: return 150;
        case ServiceType.TUBELESS_PLUG: return 200;
        case ServiceType.TOW: return 1500;
        default: return 0;
      }
    } else {
      // Car Pricing
      switch (service) {
        case ServiceType.TUBE_PATCH: return 400;
        case ServiceType.TUBELESS_PLUG: return 500;
        case ServiceType.TOW: return 3000;
        default: return 0;
      }
    }
  };

  // --- Render Helpers ---

  const renderRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.CUSTOMER: return <User size={16} />;
      case UserRole.TECHNICIAN: return <Wrench size={16} />;
      case UserRole.ADMIN: return <ShieldCheck size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-900">
      {/* Dev Role Switcher - Floating */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg rounded-full p-1 flex gap-1 border border-gray-200">
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(role)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${currentRole === role 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-gray-100'}
            `}
          >
            {renderRoleIcon(role)}
            <span className="hidden sm:inline capitalize">{role}</span>
          </button>
        ))}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-xs w-full">
            <AlertCircle size={20} className="text-brand-400" />
            <div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-xs text-slate-300">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-white">
              &times;
            </button>
          </div>
        </div>
      )}

      <Layout>
        {currentRole === UserRole.CUSTOMER && (
          <CustomerView 
            activeJob={activeJob} 
            onCreateJob={createJob} 
            onCancelJob={() => setActiveJob(null)}
            onCompleteFlow={() => setActiveJob(null)} // Reset after receipt
          />
        )}
        {currentRole === UserRole.TECHNICIAN && (
          <TechnicianView 
            activeJob={activeJob} 
            onUpdateStatus={updateJobStatus}
          />
        )}
        {currentRole === UserRole.ADMIN && (
          <AdminView 
            activeJob={activeJob}
            history={jobsHistory}
          />
        )}
      </Layout>
    </div>
  );
};

export default App;
