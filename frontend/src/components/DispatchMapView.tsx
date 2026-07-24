import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Hospital as HospitalIcon, Radio, ShieldAlert, Activity, RefreshCw, Layers, Key, CheckCircle2, Info, X } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MOCK_INCIDENT, MOCK_HOSPITALS, MOCK_AMBULANCES } from '../data/mockData';

export const DispatchMapView: React.FC = () => {
  const [mapMode, setMapMode] = useState<'google' | 'tactical'>('google');
  const [progress, setProgress] = useState(0.35);
  const [etaSeconds, setEtaSeconds] = useState(240);
  const [speedMph, setSpeedMph] = useState(48);
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);

  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 0.92 ? 0.08 : prev + 0.012));
      setEtaSeconds((prev) => (prev <= 15 ? 240 : prev - 1));
      setSpeedMph((prev) => Math.min(58, Math.max(40, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Interpolated ambulance coordinates along route from patient (37.7749, -122.4194) to hospital (37.7833, -122.4167)
  const patientPos = MOCK_INCIDENT.coordinates;
  const hospitalPos = MOCK_INCIDENT.hospitalCoords;
  const ambulancePos = {
    lat: patientPos.lat + (hospitalPos.lat - patientPos.lat) * progress,
    lng: patientPos.lng + (hospitalPos.lng - patientPos.lng) * progress
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Fleet Dispatch & GPS Mapping
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
              REAL-TIME GPS TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking patient site, available hospital beds, and dispatched ALS ambulance unit trajectory.
          </p>
        </div>

        {/* View Switcher & Key Config */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setMapMode('google')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                mapMode === 'google' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Google Maps SDK</span>
            </button>
            <button
              onClick={() => setMapMode('tactical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                mapMode === 'tactical' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Tactical GIS HUD</span>
            </button>
          </div>

          <button
            onClick={() => setShowKeyInstructions(!showKeyInstructions)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono flex items-center space-x-1.5"
            title="Google Maps API Key Status"
          >
            <Key className={`w-3.5 h-3.5 ${hasValidKey ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{hasValidKey ? 'Key Active' : 'Configure API Key'}</span>
          </button>

          <div className="flex items-center space-x-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Speed</span>
              <span className="text-white font-bold">{speedMph} mph</span>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">ETA</span>
              <span className="text-red-400 font-bold">{formatEta(etaSeconds)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal / Instruction Box */}
      <AnimatePresence>
        {showKeyInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
                <Info className="w-4 h-4" />
                <span>Google Maps Platform Integration Instructions</span>
              </div>
              <button onClick={() => setShowKeyInstructions(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300">
              To load Google Maps API directly inside the platform:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
              <li>Obtain an API Key from Google Cloud Platform Console.</li>
              <li>In AI Studio workspace, open <strong>Settings</strong> (⚙️ gear icon, top-right) → <strong>Secrets</strong>.</li>
              <li>Add secret named <code>GOOGLE_MAPS_PLATFORM_KEY</code> and paste your key.</li>
              <li>The app will rebuild automatically and activate full interactive satellite & vector Google Maps layer.</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[600px] rounded-3xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
        
        {mapMode === 'google' && hasValidKey ? (
          /* Google Maps Platform SDK Integration */
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={patientPos}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Patient Location Marker */}
              <AdvancedMarker position={patientPos} title="Incident Site - Patient Location">
                <Pin background="#ef4444" glyphColor="#ffffff" />
              </AdvancedMarker>

              {/* Dispatched Ambulance Live Animated Marker */}
              <AdvancedMarker position={ambulancePos} title="Dispatched ALS Unit #409">
                <div className="relative flex items-center justify-center p-2 rounded-2xl bg-red-600 text-white shadow-2xl border-2 border-white animate-pulse">
                  <Radio className="w-5 h-5 text-white" />
                  <span className="absolute -top-7 px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono text-red-400 border border-red-500 font-bold whitespace-nowrap">
                    ALS #409 ({speedMph} mph)
                  </span>
                </div>
              </AdvancedMarker>

              {/* Hospital Markers */}
              {MOCK_HOSPITALS.map((hosp) => (
                <AdvancedMarker key={hosp.id} position={{ lat: hosp.lat, lng: hosp.lng }} title={hosp.name}>
                  <Pin 
                    background={hosp.status === 'Optimal' ? '#10b981' : hosp.status === 'Busy' ? '#f59e0b' : '#ef4444'} 
                    glyphColor="#ffffff" 
                  />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          /* High-Tech Tactical GIS Canvas (Active Fallback & Dedicated Vector Map) */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-25" />

            {/* Vector SVG Curved Route Line */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 180 440 Q 380 160 760 280 T 1080 160"
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 180 440 Q 380 160 760 280 T 1080 160"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeDasharray="12 8"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>

            {/* Patient Location Marker */}
            <div className="absolute left-[180px] top-[440px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              <div className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-mono font-bold shadow-xl mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>INCIDENT SITE (742 Evergreen)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white animate-ping" />
            </div>

            {/* Hospital Location Markers */}
            {MOCK_HOSPITALS.map((hosp, idx) => {
              const xPos = idx === 0 ? 1080 : idx === 1 ? 520 : 850;
              const yPos = idx === 0 ? 160 : idx === 1 ? 380 : 460;
              return (
                <div key={hosp.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20" style={{ left: `${xPos}px`, top: `${yPos}px` }}>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/20 text-white text-[11px] font-mono font-bold shadow-xl mb-1 flex items-center space-x-1">
                    <HospitalIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{hosp.name}</span>
                    <span className="text-emerald-400">({hosp.availableICUBeds} ICU)</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-2xl">
                    H
                  </div>
                </div>
              );
            })}

            {/* Moving Ambulance Marker */}
            <motion.div
              className="absolute z-30 flex flex-col items-center"
              style={{
                left: `${180 + (1080 - 180) * progress}px`,
                top: `${440 + (160 - 440) * Math.sin(progress * Math.PI)}px`
              }}
            >
              <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-red-500 text-red-400 text-xs font-mono font-bold shadow-2xl flex items-center space-x-2 whitespace-nowrap">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>🚑 ALS Rescue Unit #409</span>
                <span className="text-white">({speedMph} mph)</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/80 border-2 border-white animate-bounce mt-1">
                <Navigation className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        )}

        {/* HUD Telemetry Overlay */}
        <div className="absolute top-6 left-6 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 max-w-xs space-y-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-red-400 font-bold border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4" />
            <span>ACTIVE INCIDENT TELEMETRY</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div>Incident ID: CAS-2026-8832</div>
            <div>Patient: Robert Vance, 64M</div>
            <div>Threat Level: <strong className="text-red-400">CRITICAL</strong></div>
            <div>Route Distance: 2.4 miles</div>
            <div className="text-emerald-400 font-bold">Live ETA: {formatEta(etaSeconds)}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono backdrop-blur-xl">
          <span className="text-slate-400 uppercase text-[10px] block font-bold">Network Map Legend</span>
          <div className="flex items-center space-x-2 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Emergency Incident Location</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Receiving Hospital (Metro Trauma)</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span>Dispatched ALS Unit #409 En Route</span>
          </div>
        </div>

      </div>
    </div>
  );
};
