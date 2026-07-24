import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Hospital as HospitalIcon, Radio, Activity, Plus, Edit2, Trash2, 
  Search, Filter, CheckCircle2, AlertTriangle, Clock, RefreshCw, BarChart3, 
  Users, Building2, Save, X, Server
} from 'lucide-react';
import { Hospital, EmergencyIncident, SystemStats, User } from '../types';

interface AdminPanelProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onOpenAuth }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'hospitals' | 'incidents'>('overview');
  
  // State
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Hospital Form Modal State
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  
  const [hospForm, setHospForm] = useState({
    name: '',
    address: '',
    traumaLevel: 'Level 1 Trauma',
    availableICUBeds: 10,
    totalBeds: 150,
    specialties: 'Orthopedics, Cardiology, Emergency Surgery',
    status: 'Optimal' as 'Optimal' | 'Busy' | 'Diverting',
    lat: 37.7800,
    lng: -122.4100
  });

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resHosp, resInc] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/hospitals'),
        fetch('/api/admin/incidents')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resHosp.ok) setHospitals(await resHosp.json());
      if (resInc.ok) setIncidents(await resInc.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Hospital Create/Update
  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specialtiesArray = hospForm.specialties.split(',').map(s => s.trim());
      const body = {
        ...hospForm,
        availableICUBeds: Number(hospForm.availableICUBeds),
        totalBeds: Number(hospForm.totalBeds),
        specialties: specialtiesArray
      };

      if (editingHospital) {
        const res = await fetch(`/api/admin/hospitals/${editingHospital.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const updated = await res.json();
          setHospitals(hospitals.map(h => h.id === updated.id ? updated : h));
        }
      } else {
        const res = await fetch('/api/admin/hospitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const newHosp = await res.json();
          setHospitals([...hospitals, newHosp]);
        }
      }

      setIsAddHospitalOpen(false);
      setEditingHospital(null);
      resetHospForm();
    } catch (err) {
      console.error('Failed to save hospital:', err);
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hospital listing from the emergency network?')) return;
    try {
      const res = await fetch(`/api/admin/hospitals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHospitals(hospitals.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete hospital:', err);
    }
  };

  const handleUpdateIncidentPriority = async (id: string, priority: string) => {
    try {
      const res = await fetch(`/api/admin/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents(incidents.map(i => i.id === updated.id ? updated : i));
      }
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const resetHospForm = () => {
    setHospForm({
      name: '',
      address: '',
      traumaLevel: 'Level 1 Trauma',
      availableICUBeds: 10,
      totalBeds: 150,
      specialties: 'Orthopedics, Cardiology, Emergency Surgery',
      status: 'Optimal',
      lat: 37.7800,
      lng: -122.4100
    });
  };

  const openEditHospital = (hosp: Hospital) => {
    setEditingHospital(hosp);
    setHospForm({
      name: hosp.name,
      address: hosp.address,
      traumaLevel: hosp.traumaLevel,
      availableICUBeds: hosp.availableICUBeds,
      totalBeds: hosp.totalBeds,
      specialties: hosp.specialties.join(', '),
      status: hosp.status,
      lat: hosp.lat,
      lng: hosp.lng
    });
    setIsAddHospitalOpen(true);
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesQuery = inc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inc.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-red-500/20 border border-red-500/30 text-red-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SYSTEM COMMAND CENTER</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4 EMS Enterprise</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Administrative Control Panel</h2>
          <p className="text-xs text-slate-400">Manage regional hospital capacity, dispatch incident overrides, and system telemetry.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2 text-xs font-mono"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Admin Sign In</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">{currentUser.name}</span>
              <span className="text-slate-500 font-mono">({currentUser.role})</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Navigation Sub-tabs */}
      <div className="flex border-b border-white/10 space-x-4">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-2 font-mono text-xs font-bold tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            activeSubTab === 'overview'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>System Analytics & Statistics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hospitals')}
          className={`pb-3 px-2 font-mono text-xs font-bold tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            activeSubTab === 'hospitals'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HospitalIcon className="w-4 h-4" />
          <span>Hospital Listings ({hospitals.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`pb-3 px-2 font-mono text-xs font-bold tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            activeSubTab === 'incidents'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Incident Command Center ({incidents.length})</span>
        </button>
      </div>

      {/* --- SUBTAB 1: SYSTEM OVERVIEW STATS --- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total Incidents Today</span>
              <p className="text-2xl font-black text-white">{stats?.totalIncidentsToday || 42}</p>
              <span className="text-[10px] text-emerald-400 font-mono">+12% vs avg</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Dispatches</span>
              <p className="text-2xl font-black text-red-400">{stats?.activeDispatches || 2}</p>
              <span className="text-[10px] text-red-300 font-mono">Live Dispatch Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Response Time</span>
              <p className="text-2xl font-black text-blue-400">3.8 min</p>
              <span className="text-[10px] text-blue-300 font-mono">228 sec average</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">ICU Bed Occupancy</span>
              <p className="text-2xl font-black text-amber-400">{stats?.icuBedOccupancyRate || 74}%</p>
              <span className="text-[10px] text-amber-300 font-mono">23 ICU Beds Free</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Network Hospitals</span>
              <p className="text-2xl font-black text-emerald-400">{stats?.totalHospitalsOnline || 3}</p>
              <span className="text-[10px] text-emerald-300 font-mono">100% Online</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase">SLA Target Rate</span>
              <p className="text-2xl font-black text-purple-400">98.6%</p>
              <span className="text-[10px] text-purple-300 font-mono">&lt; 5 min SLA</span>
            </div>
          </div>

          {/* Regional Medical System Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hospital Capacity Matrix */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-red-400" />
                  <span>Regional Hospital ICU Bed Capacity</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Live Telemetry Feed</span>
              </div>

              <div className="space-y-3">
                {hospitals.map((hosp) => {
                  const used = hosp.totalBeds - hosp.availableICUBeds;
                  const pct = Math.round((used / hosp.totalBeds) * 100);
                  return (
                    <div key={hosp.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{hosp.name}</h4>
                          <p className="text-xs text-slate-400">{hosp.traumaLevel} • {hosp.address}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          hosp.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          hosp.status === 'Busy' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {hosp.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Bed Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>ICU Bed Availability: <strong className="text-white">{hosp.availableICUBeds} Free</strong></span>
                          <span>Total Capacity: {hosp.totalBeds} Beds ({pct}% full)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status Logs & Dispatch Compliance */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-md">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-400" />
                <span>Dispatch System Telemetry</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">AI Triage Latency</span>
                  <span className="font-mono text-emerald-400 font-bold">142 ms</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Google Maps Geocoding API</span>
                  <span className="font-mono text-emerald-400 font-bold">Connected</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Active Paramedic Units</span>
                  <span className="font-mono text-white font-bold">3 Units Online</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">AI Vision Fracture Detection</span>
                  <span className="font-mono text-emerald-400 font-bold">96% Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: HOSPITAL LISTINGS MANAGEMENT --- */}
      {activeSubTab === 'hospitals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Registered Regional Hospitals</h3>
            <button
              onClick={() => {
                resetHospForm();
                setEditingHospital(null);
                setIsAddHospitalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hospital Listing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hosp) => (
              <div key={hosp.id} className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-md flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {hosp.traumaLevel}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{hosp.name}</h4>
                      <p className="text-xs text-slate-400">{hosp.address}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      hosp.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
                      hosp.status === 'Busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {hosp.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Available ICU Beds:</span>
                      <strong className="text-white font-mono">{hosp.availableICUBeds} / {hosp.totalBeds}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Specialties:</span>
                      <span className="text-slate-400 text-right truncate max-w-[160px]">{hosp.specialties.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditHospital(hosp)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center space-x-1 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteHospital(hosp.id)}
                    className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors flex items-center space-x-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: EMERGENCY INCIDENTS COMMAND TABLE --- */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient, case #, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MODERATE">MODERATE</option>
              </select>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="rounded-3xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Case Number</th>
                    <th className="p-4">Patient / Vitals</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Priority Override</th>
                    <th className="p-4">Assigned Unit</th>
                    <th className="p-4">Target Hospital</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-red-400">{inc.caseNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{inc.patientName}</div>
                        <div className="text-[10px] text-slate-400">{inc.age}M • {inc.bloodType}</div>
                      </td>
                      <td className="p-4 text-slate-300">{inc.location}</td>
                      <td className="p-4">
                        <select
                          value={inc.priority}
                          onChange={(e) => handleUpdateIncidentPriority(inc.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                            inc.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                            inc.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          }`}
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MODERATE">MODERATE</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </td>
                      <td className="p-4 font-mono text-slate-200">{inc.assignedAmbulance}</td>
                      <td className="p-4 text-slate-300">{inc.recommendedHospital}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT HOSPITAL MODAL --- */}
      <AnimatePresence>
        {isAddHospitalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">
                  {editingHospital ? 'Edit Hospital Listing' : 'Add New Hospital Listing'}
                </h3>
                <button
                  onClick={() => setIsAddHospitalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveHospital} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    required
                    placeholder="St. Michael Emergency Center"
                    value={hospForm.name}
                    onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Address / Sector</label>
                  <input
                    type="text"
                    required
                    placeholder="500 Medical Center Blvd"
                    value={hospForm.address}
                    onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Trauma Designation</label>
                    <select
                      value={hospForm.traumaLevel}
                      onChange={(e) => setHospForm({ ...hospForm, traumaLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    >
                      <option value="Level 1 Trauma">Level 1 Trauma</option>
                      <option value="Level 2 Trauma">Level 2 Trauma</option>
                      <option value="Community ER">Community ER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Network Status</label>
                    <select
                      value={hospForm.status}
                      onChange={(e) => setHospForm({ ...hospForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Busy">Busy</option>
                      <option value="Diverting">Diverting</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Available ICU Beds</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={hospForm.availableICUBeds}
                      onChange={(e) => setHospForm({ ...hospForm, availableICUBeds: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Total Bed Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={hospForm.totalBeds}
                      onChange={(e) => setHospForm({ ...hospForm, totalBeds: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Specialties (Comma Separated)</label>
                  <input
                    type="text"
                    value={hospForm.specialties}
                    onChange={(e) => setHospForm({ ...hospForm, specialties: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddHospitalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Hospital</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
