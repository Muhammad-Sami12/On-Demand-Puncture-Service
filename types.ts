
export enum UserRole {
  CUSTOMER = 'customer',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum VehicleType {
  BIKE = 'Bike',
  CAR = 'Car',
}

export enum JobStatus {
  SEARCHING = 'searching', // Customer looking for tech
  OFFERED = 'offered',     // Offered to a tech
  ACCEPTED = 'accepted',   // Tech accepted, en route
  ARRIVED = 'arrived',     // Tech arrived at location
  IN_PROGRESS = 'in_progress', // Tech working
  COMPLETED = 'completed', // Work done, paid
  CANCELLED = 'cancelled',
}

export enum ServiceType {
  TUBE_PATCH = 'Tube Patch',
  TUBELESS_PLUG = 'Tubeless Plug',
  TOW = 'Tow Service',
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface GroundedPlace {
  title: string;
  uri: string;
  snippet?: string;
  location?: GeoLocation;
}

export interface Job {
  id: string;
  customerId: string;
  technicianId: string | null;
  status: JobStatus;
  serviceType: ServiceType;
  vehicleType: VehicleType;
  location: GeoLocation;
  createdAt: Date;
  updatedAt?: Date;
  price: number;
  otp: string;
  
  // Technician Data
  photoStart?: string; // Base64 or URL
  photoEnd?: string;   // Base64 or URL
  rating?: number;
}

export interface PhotoAnalysisResult {
  isValid: boolean;
  brightness: 'low' | 'ok' | 'high';
  blur: 'high' | 'ok';
  isTire: boolean;
  feedback: string;
}
