import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Heart, Activity, Radio, MapPin, Navigation, Clock, ShieldAlert,
  FileText, Camera, PhoneCall, CheckCircle2, ChevronRight, User, Hospital as HospitalIcon,
  Search, Bell, Settings, Filter, RefreshCw, Layers, ShieldCheck, Zap, Compass, Maximize2
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { EmergencyIncident, Hospital } from '../types';
import { MOCK_INCIDENT, MOCK_HOSPITALS } from '../data/mockData';

interface HospitalDashboardProps {
  isEmergencyAlertActive: boolean;
  onToggleEmergencyAlert: () => void;
  onNavigateToVision?: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  isEmergencyAlertActive,
  onToggleEmergencyAlert,
  onNavigateToVision
}) => {
  const [incident, setIncident] = useState<EmergencyIncident>(MOCK_INCIDENT);
  const [isLoading, setIsLoading] = useState(false);
  const [etaCountdown, setEtaCountdown] = useState(incident.etaSeconds);
  const [ambulanceProgress, setAmbulanceProgress] = useState(0.42); // 0 to 1 along route
  const [speedMph, setSpeedMph] = useState(incident.speedMph);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mapMode, setMapMode] = useState<'google' | 'tactical'>('google');
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'timeline' | 'vision'>('overview');

  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // Live clock & moving ambulance progress animation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const timer = setInterval(() => {
      setEtaCountdown((prev) => (prev <= 10 ? 240 : prev - 1));
      setAmbulanceProgress((prev) => (prev >= 0.95 ? 0.05 : prev + 0.008));
      setSpeedMph((prev) => Math.min(56, Math.max(42, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(timer);
    };
  }, []);

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  // Coordinates interpolation
  const patientPos = incident.coordinates;
  const hospitalPos = incident.hospitalCoords;
  const currentAmbulancePos = {
    lat: patientPos.lat + (hospitalPos.lat - patientPos.lat) * ambulanceProgress,
    lng: patientPos.lng + (hospitalPos.lng - patientPos.lng) * ambulanceProgress
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 py-6 px-4 sm:px-6 lg:px-8 font-sans ${
      isEmergencyAlertActive
        ? 'bg-red-950/30 shadow-[inset_0_0_120px_rgba(239,68,68,0.2)]'
        : 'bg-transparent'
    }`}>
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================
            TOP BAR: EMERGENCY OPERATIONS HEADER & METRICS
           ======================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl">
          
          {/* Emergency Title & Status */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>🚨 ACTIVE EMERGENCY COMMAND</span>
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">{currentTime || '21:53:08'} UTC</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Regional EMS Dispatch & Trauma Center
              </h1>
            </div>
          </div>

          {/* KPI Metrics Row (Active Incidents, Ambulances, Response Time) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
              <Activity className="w-4 h-4 text-red-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Active Incidents</span>
                <span className="text-sm font-black text-white font-mono">12 Active</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
              <Radio className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Available Fleet</span>
                <span className="text-sm font-black text-amber-400 font-mono">18 Units</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Avg Response Time</span>
                <span className="text-sm font-black text-emerald-400 font-mono">3.8 min</span>
              </div>
            </div>

            {/* Quick Refresh & Alert Trigger */}
            <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onToggleEmergencyAlert}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all shadow-lg ${
                  isEmergencyAlertActive
                    ? 'bg-red-600 text-white border-red-400 animate-bounce shadow-red-600/50'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isEmergencyAlertActive ? 'MUTE ALERT' : 'TRIGGER ALERT'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* 🚨 ANIMATED EMERGENCY ALERT BANNER */}
        <AnimatePresence>
          {isEmergencyAlertActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              className="relative rounded-[20px] bg-gradient-to-r from-red-600 via-red-700 to-amber-600 p-5 sm:p-6 text-white shadow-2xl shadow-red-600/50 border-2 border-red-400 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-pulse">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-white text-red-700 font-mono text-[10px] font-black uppercase">
                        CRITICAL RED ALERT
                      </span>
                      <span className="text-xs font-mono text-red-100">{incident.caseNumber}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                      🚨 INBOUND CRITICAL TRAUMA PATIENT
                    </h2>
                    <p className="text-xs text-red-100 mt-0.5 max-w-2xl">
                      ALS Unit #409 inbound to Metro Trauma Center with 64yo male (Staircase fall, suspected compound femur fracture). Pre-arrival Trauma Bay 3 prepped.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-black/40 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-white">{formatEta(etaCountdown)}</div>
                    <div className="text-[10px] text-red-200 uppercase font-sans">ETA to Bay 3</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            MAIN LAYOUT: HERO MAP (65-70%) + RIGHT SIDEBAR (30-35%)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================== PRIORITY 1 HERO MAP (66.6% WIDTH) ==================== */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="relative w-full h-[540px] sm:h-[580px] rounded-[20px] bg-slate-950 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl group">
              
              {/* Map Layer Switcher Header Bar */}
              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto flex items-center space-x-2 bg-slate-950/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    LIVE DISPATCH TRACKING
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 border-l border-white/10 pl-2">
                    {speedMph} MPH
                  </span>
                </div>

                <div className="pointer-events-auto flex items-center space-x-2 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-2xl">
                  <button
                    onClick={() => setMapMode('google')}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1 ${
                      mapMode === 'google' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </button>
                  <button
                    onClick={() => setMapMode('tactical')}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1 ${
                      mapMode === 'tactical' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Tactical GIS</span>
                  </button>
                </div>
              </div>

              {/* FLOATING LIVE ETA BADGE ABOVE ROUTE */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-red-500 text-white shadow-2xl backdrop-blur-xl flex items-center space-x-3"
                >
                  <Clock className="w-4 h-4 text-red-400 animate-pulse" />
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-mono text-slate-300">LIVE ETA:</span>
                    <span className="text-base font-black font-mono text-red-400">{formatEta(etaCountdown)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({incident.distanceMiles} mi)</span>
                  </div>
                </motion.div>
              </div>

              {/* MAP CANVAS CONTENT */}
              {mapMode === 'google' && hasValidKey ? (
                /* Google Maps Platform SDK Integration */
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={patientPos}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Patient Location Marker */}
                    <AdvancedMarker position={patientPos} title="Incident Site - Patient Location">
                      <Pin background="#ef4444" glyphColor="#ffffff" />
                    </AdvancedMarker>

                    {/* Dispatched Ambulance Marker */}
                    <AdvancedMarker position={currentAmbulancePos} title="Dispatched ALS Unit #409">
                      <div className="relative flex items-center justify-center p-2 rounded-2xl bg-red-600 text-white shadow-2xl border-2 border-white animate-pulse">
                        <Radio className="w-5 h-5 text-white" />
                        <span className="absolute -top-7 px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono text-red-400 border border-red-500 font-bold whitespace-nowrap">
                          ALS #409 ({speedMph} mph)
                        </span>
                      </div>
                    </AdvancedMarker>

                    {/* Target Hospital Marker */}
                    <AdvancedMarker position={hospitalPos} title="Metro Trauma Center">
                      <Pin background="#10b981" glyphColor="#ffffff" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                /* High-Tech Tactical GIS Canvas (Dark Google Maps Styled Vector Engine) */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#090b10]">
                  
                  {/* Dark Map Grid Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-40" />

                  {/* Vector SVG Curved Route Line */}
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Road Outline */}
                    <path
                      d="M 160 420 Q 340 140 680 260 T 960 140"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                    {/* Glowing active route */}
                    <path
                      d="M 160 420 Q 340 140 680 260 T 960 140"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="5"
                      strokeDasharray="12 8"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* PATIENT MARKER WITH PULSING RADAR RADIUS CIRCLE */}
                  <div className="absolute left-[160px] top-[420px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                    {/* Radar Pulse Rings */}
                    <div className="absolute w-32 h-32 rounded-full border-2 border-red-500/30 bg-red-500/10 animate-ping pointer-events-none" />
                    <div className="absolute w-56 h-56 rounded-full border border-red-500/20 pointer-events-none" />

                    <div className="px-3 py-1 rounded-xl bg-slate-950 border border-red-500 text-white text-[10px] font-mono font-bold shadow-2xl mb-1.5 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                      <span>PATIENT SITE (742 Evergreen)</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-2xl text-white">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* RECEIVING HOSPITAL MARKER WITH LIVE ICU BED BADGE */}
                  <div className="absolute right-[140px] top-[140px] translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                    <div className="px-3 py-1 rounded-xl bg-slate-950 border border-emerald-500/60 text-white text-[10px] font-mono font-bold shadow-2xl mb-1.5 flex items-center space-x-1.5">
                      <HospitalIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>METRO TRAUMA CENTER</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px]">
                        8 ICU FREE
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-2xl shadow-emerald-500/50">
                      H
                    </div>
                  </div>

                  {/* ANIMATED MOVING AMBULANCE MARKER */}
                  <motion.div
                    className="absolute z-30 flex flex-col items-center"
                    style={{
                      left: `${160 + (820 - 160) * ambulanceProgress}px`,
                      top: `${420 + (140 - 420) * Math.sin(ambulanceProgress * Math.PI)}px`
                    }}
                  >
                    <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border-2 border-red-500 text-red-400 text-xs font-mono font-bold shadow-2xl flex items-center space-x-2 whitespace-nowrap">
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>🚑 ALS Rescue Unit #409</span>
                      <span className="text-white font-mono">({speedMph} mph)</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/80 border-2 border-white animate-bounce mt-1">
                      <Navigation className="w-5 h-5" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* BOTTOM TELEMETRY HUD OVERLAY */}
              <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col sm:flex-row items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl text-xs font-mono">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Compass className="w-4 h-4 text-red-400" />
                  <span>GPS: 37.7749° N, 122.4194° W</span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="hidden sm:inline text-emerald-400 font-bold">Priority Signal Corridor Active</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <span>Dist: {incident.distanceMiles} miles</span>
                  <span className="text-white font-bold">Speed: {speedMph} mph</span>
                </div>
              </div>

            </div>

          </div>

          {/* ==================== RIGHT SIDEBAR (33.3% WIDTH): GLASSMORPHISM CARDS ==================== */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* CARD 1: PATIENT INFORMATION & SEVERITY */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 hover:border-red-500/40 transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{incident.patientName}</h3>
                    <p className="text-[10px] text-slate-400">{incident.age} yo Male • Blood Type: {incident.bloodType}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-400 animate-pulse">
                  CRITICAL - TIER 1
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Incident Location</span>
                  <p className="text-slate-200 font-medium flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{incident.location}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Clinical Triage Symptoms</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {incident.symptoms.map((symptom, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-red-950/60 border border-red-500/30 text-[11px] font-medium text-red-300">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: AI TRIAGE SUMMARY */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3 hover:border-red-500/40 transition-all"
            >
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI CLINICAL TRIAGE SUMMARY</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Primary assessment indicates severe blunt force trauma from staircase fall. High risk of compound left femur fracture with localized swelling.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <div className="text-slate-400 text-[10px] font-mono uppercase">Pre-Arrival Recommendation</div>
                <div className="text-white font-bold">Trauma Bay 3 + Orthopedic Surgery Team Prepped</div>
              </div>
            </motion.div>

            {/* CARD 3: RECEIVING HOSPITAL RECOMMENDATION */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
                  <HospitalIcon className="w-4 h-4" />
                  <span>TARGET HOSPITAL FACILITY</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                  Optimal Bed
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{incident.recommendedHospital}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Level 1 Trauma Center • 100 Medical Center Way</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-slate-400 font-mono">ICU Bed Availability:</span>
                <span className="text-emerald-400 font-mono font-bold">8 Beds Available</span>
              </div>
            </motion.div>

            {/* CARD 4: DISPATCH AMBULANCE & ETA */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3 hover:border-red-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-red-400">
                  <Radio className="w-4 h-4" />
                  <span>DISPATCHED AMBULANCE</span>
                </div>
                <span className="text-xs font-mono text-white font-bold">{speedMph} mph</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{incident.assignedAmbulance}</h4>
                  <p className="text-xs text-slate-400">ALS Unit • 3 Paramedics Onboard</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-black text-red-400">{formatEta(etaCountdown)}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Live ETA</div>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

        {/* ========================================================
            BOTTOM SECTION: TRANSCRIPT, TIMELINE & AI VISION
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          
          {/* 1. LIVE VOICE CALL TRANSCRIPT */}
          <div className="p-6 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Live Voice Call Transcript
                </h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">Live Listening</span>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {incident.transcript.map((msg) => {
                const isAI = msg.speaker === 'AI';
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 border transition-all ${
                      isAI
                        ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                        : 'bg-red-950/40 border-red-500/20 text-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isAI ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                        {msg.speaker}
                      </span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                );
              })}

              {/* Live Typing Indicator */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-2 text-xs text-slate-400">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] font-mono">AI Dispatcher listening for voice inputs...</span>
              </div>
            </div>
          </div>

          {/* 2. EMERGENCY INCIDENT RESPONSE TIMELINE */}
          <div className="p-6 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Emergency Incident Timeline</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Audit Trail</span>
            </div>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {[
                { time: '09:41:12', label: 'Call Received', desc: 'Emergency call connected to AI Dispatcher.', status: 'completed' },
                { time: '09:41:23', label: 'Ambulance Dispatched', desc: 'ALS Rescue Unit #409 deployed.', status: 'completed' },
                { time: '09:41:40', label: 'Image Uploaded', desc: 'Caller transmitted trauma injury photo.', status: 'completed' },
                { time: '09:41:52', label: 'Vision Analysis Complete', desc: 'Femur fracture detected with 96% confidence.', status: 'completed' },
                { time: '09:42:01', label: 'Hospital Alert Sent', desc: 'Metro Trauma Center Bay 3 pre-notified.', status: 'in-progress' }
              ].map((event, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div
                    className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 ${
                      event.status === 'completed'
                        ? 'bg-emerald-500 border-slate-950'
                        : 'bg-amber-500 border-slate-950 animate-ping'
                    }`}
                  />
                  <div className="text-[10px] font-mono text-slate-500">{event.time}</div>
                  <div className="text-xs font-bold text-white">{event.label}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{event.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. UPLOADED INJURY IMAGE & AI VISION ANALYSIS */}
          <div className="p-6 rounded-[20px] bg-black/50 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  AI Vision Trauma Scan
                </h3>
              </div>
              {onNavigateToVision && (
                <button
                  onClick={onNavigateToVision}
                  className="text-xs font-mono font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                >
                  <span>Full Scan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Photo Thumbnail with Scan line */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-36 bg-slate-950 group">
                <img
                  src={incident.injuryImage}
                  alt="Trauma Scan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-4 border-2 border-dashed border-red-500 rounded-xl bg-red-500/10 flex items-start p-2">
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-bold">
                    COMPOUND FEMUR FRACTURE (96%)
                  </span>
                </div>
                {/* Animated Scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_15px_#ef4444] animate-pulse top-1/2" />
              </div>

              {/* Action Steps */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400">Paramedic Action Protocol</div>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Keep patient supine; do not adjust left leg.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Prepare rigid traction splint upon ALS arrival.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
