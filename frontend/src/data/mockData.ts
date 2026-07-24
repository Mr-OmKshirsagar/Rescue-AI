import { EmergencyIncident, Hospital, AmbulanceUnit } from '../types';

export const MOCK_INCIDENT: EmergencyIncident = {
  id: 'inc-911-8492',
  caseNumber: 'CAS-2026-8832',
  patientName: 'Robert Vance',
  age: 64,
  gender: 'Male',
  bloodType: 'O-Positive',
  location: '742 Evergreen Terrace, Sector 4',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  priority: 'CRITICAL',
  symptoms: ['Staircase Fall Trauma', 'Severe Left Leg Pain', 'Suspected Compound Fracture', 'Localized Edema'],
  recommendedHospital: 'Metro Trauma Center & Heart Institute',
  hospitalCoords: { lat: 37.7833, lng: -122.4167 },
  assignedAmbulance: 'ALS Rescue Unit #409',
  ambulanceCoords: { lat: 37.7710, lng: -122.4250 },
  speedMph: 48,
  etaSeconds: 252, // 4 mins 12 secs
  distanceMiles: 2.4,
  status: 'In Transit',
  transcript: [
    { id: 't1', speaker: 'AI', text: 'Hello, this is ResqAI Emergency Dispatcher. Do you need an ambulance right now?', timestamp: '21:28:02' },
    { id: 't2', speaker: 'Caller', text: 'Yes, please help! My father fell down the stairs and cannot move!', timestamp: '21:28:06' },
    { id: 't3', speaker: 'AI', text: 'Stay calm. I am analyzing your location and dispatching an Advanced Life Support ambulance immediately. Is he conscious and breathing?', timestamp: '21:28:10' },
    { id: 't4', speaker: 'Caller', text: 'He is conscious, but he is in intense pain near his thigh. His leg looks twisted.', timestamp: '21:28:15' },
    { id: 't5', speaker: 'AI', text: 'Ambulance #409 has been dispatched and is 4 minutes away. I have sent an alert to Metro Trauma Center. Do not attempt to move his leg.', timestamp: '21:28:20', isAlert: true },
    { id: 't6', speaker: 'Caller', text: 'Okay, I won’t move him. Thank you so much.', timestamp: '21:28:25' }
  ],
  injuryImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  aiVisionAnalysis: {
    condition: 'Possible Compound Femur Fracture',
    severity: 'HIGH',
    confidenceScore: 96,
    keyObservations: [
      'Visible 14° lateral angular alignment deformation of left thigh',
      'Localized sub-dermal hematoma with minor skin abrasion',
      'No major arterial pulse interruption indicated'
    ],
    recommendations: [
      'Keep patient supine; do not adjust or rotate the left leg',
      'Apply clean sterile gauze above abrasion if bleeding persists',
      'Prepare traction splint upon ALS arrival'
    ],
    suggestedHospital: 'Metro Trauma Center & Heart Institute',
    traumaLevel: 'Level 1 Trauma Standby Requested'
  },
  timeline: [
    { time: '21:28:02', label: 'Emergency Voice Call Initiated', description: 'Caller connected via ResqAI AI Voice Protocol.', status: 'completed' },
    { time: '21:28:08', label: 'AI Medical Triage Complete', description: 'Priority classified as CRITICAL (Fall trauma / Fracture).', status: 'completed' },
    { time: '21:28:12', label: 'ALS Unit #409 Dispatched', description: 'Paramedic crew en route with 2.4 mi distance.', status: 'completed' },
    { time: '21:28:20', label: 'Metro Trauma Center Pre-Notified', description: 'Vitals & injury report sent to ER trauma bay 3.', status: 'completed' },
    { time: '21:28:45', label: 'Injury Photo Vision Analyzed', description: 'AI confirmed suspected femur fracture, severity HIGH.', status: 'in-progress' },
    { time: '21:32:14', label: 'Ambulance On Scene (Est.)', description: 'Paramedics arrive with rigid splint gear.', status: 'pending' }
  ]
};

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Metro Trauma Center & Heart Institute',
    address: '100 Medical Center Way, Bay Area',
    traumaLevel: 'Level 1 Trauma',
    availableICUBeds: 8,
    totalBeds: 120,
    distanceMiles: 2.4,
    etaMinutes: 4,
    specialties: ['Orthopedic Surgery', 'Cardiology', 'Neurotrauma'],
    lat: 37.7833,
    lng: -122.4167,
    status: 'Optimal'
  },
  {
    id: 'hosp-2',
    name: 'City Orthopedic & General Hospital',
    address: '450 University Ave, Downtown',
    traumaLevel: 'Level 2 Trauma',
    availableICUBeds: 3,
    totalBeds: 85,
    distanceMiles: 4.1,
    etaMinutes: 8,
    specialties: ['Joint Surgery', 'Burn Care', 'Pediatrics'],
    lat: 37.7650,
    lng: -122.4300,
    status: 'Busy'
  },
  {
    id: 'hosp-3',
    name: 'St. Jude Emergency & Acute Care',
    address: '890 Mission Blvd, Sector 7',
    traumaLevel: 'Level 1 Trauma',
    availableICUBeds: 12,
    totalBeds: 210,
    distanceMiles: 5.8,
    etaMinutes: 11,
    specialties: ['Cardiac Arrest', 'Stroke Care', 'Respiratory'],
    lat: 37.7500,
    lng: -122.4000,
    status: 'Optimal'
  }
];

export const MOCK_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb-409',
    unitCode: 'ALS Unit #409',
    type: 'Advanced Life Support (ALS)',
    paramedicCount: 3,
    driverName: 'Officer M. Vance',
    currentLocation: 'Mission District Transit Corridor',
    lat: 37.7710,
    lng: -122.4250,
    speedMph: 48,
    assignedIncidentId: 'inc-911-8492',
    status: 'En Route'
  },
  {
    id: 'amb-102',
    unitCode: 'ALS Unit #102',
    type: 'Advanced Life Support (ALS)',
    paramedicCount: 2,
    driverName: 'Officer J. Thorne',
    currentLocation: 'Downtown Expressway',
    lat: 37.7800,
    lng: -122.4050,
    speedMph: 0,
    status: 'Available'
  },
  {
    id: 'amb-501',
    unitCode: 'AIR EVAC #501',
    type: 'Air Evac Helicopter',
    paramedicCount: 4,
    driverName: 'Capt. R. Sterling',
    currentLocation: 'Helipad Alpha Station',
    lat: 37.7900,
    lng: -122.3900,
    speedMph: 140,
    status: 'Available'
  }
];
