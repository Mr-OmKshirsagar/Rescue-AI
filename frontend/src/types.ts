export type AppView = 'landing' | 'dashboard' | 'call-simulator' | 'camera-upload' | 'dispatch-map' | 'admin';

export type UserRole = 'admin' | 'dispatcher' | 'paramedic' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  department?: string;
  avatarUrl?: string;
}

export type NotificationType = 'DISPATCH' | 'ETA_UPDATE' | 'HOSPITAL_ALERT' | 'TRIAGE_ALERT' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  incidentId?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface SystemStats {
  totalIncidentsToday: number;
  activeDispatches: number;
  averageResponseTimeSec: number;
  icuBedOccupancyRate: number;
  totalHospitalsOnline: number;
  slaCompliancePercentage: number;
}

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface TimelineEvent {
  time: string;
  label: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface AIVisionAnalysis {
  condition: string;
  severity: PriorityLevel;
  confidenceScore: number;
  keyObservations: string[];
  recommendations: string[];
  suggestedHospital: string;
  traumaLevel: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: 'AI' | 'Caller' | 'Dispatcher';
  text: string;
  timestamp: string;
  isAlert?: boolean;
}

export interface EmergencyIncident {
  id: string;
  caseNumber: string;
  patientName: string;
  age: number;
  gender: string;
  bloodType: string;
  location: string;
  coordinates: { lat: number; lng: number };
  priority: PriorityLevel;
  symptoms: string[];
  recommendedHospital: string;
  hospitalCoords: { lat: number; lng: number };
  assignedAmbulance: string;
  ambulanceCoords: { lat: number; lng: number };
  speedMph: number;
  etaSeconds: number;
  distanceMiles: number;
  status: 'In Transit' | 'Arrived' | 'Hospital Notified' | 'Triage Active';
  transcript: TranscriptMessage[];
  injuryImage?: string;
  aiVisionAnalysis?: AIVisionAnalysis;
  timeline: TimelineEvent[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  traumaLevel: string;
  availableICUBeds: number;
  totalBeds: number;
  distanceMiles: number;
  etaMinutes: number;
  specialties: string[];
  lat: number;
  lng: number;
  status: 'Optimal' | 'Busy' | 'Diverting';
}

export interface AmbulanceUnit {
  id: string;
  unitCode: string;
  type: 'Advanced Life Support (ALS)' | 'Basic Life Support (BLS)' | 'Air Evac Helicopter';
  paramedicCount: number;
  driverName: string;
  currentLocation: string;
  lat: number;
  lng: number;
  speedMph: number;
  assignedIncidentId?: string;
  status: 'Dispatched' | 'En Route' | 'On Scene' | 'Available';
}
