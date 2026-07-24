import React, { useState, useEffect } from 'react';
import { AppView, User, NotificationItem } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorksTimeline } from './components/HowItWorksTimeline';
import { LiveDemoPhone } from './components/LiveDemoPhone';
import { HospitalDashboard } from './components/HospitalDashboard';
import { CallSimulatorView } from './components/CallSimulatorView';
import { CameraUploadView } from './components/CameraUploadView';
import { DispatchMapView } from './components/DispatchMapView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Activity } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isEmergencyAlertActive, setIsEmergencyAlertActive] = useState(false);
  
  // Auth & Notifications State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Check stored user session on mount
  useEffect(() => {
    const token = localStorage.getItem('resq_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch((err) => console.error('Failed to verify user session:', err));
    }

    // Fetch notifications
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 10000); // sync every 10s
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('resq_auth_token', token);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('resq_auth_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('resq_auth_token');
    setCurrentUser(null);
  };

  const handleMarkRead = async (id?: string) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleTriggerAlert = async (type: string, title: string, message: string, severity: 'critical' | 'warning' | 'info' = 'info') => {
    try {
      const res = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, message, severity })
      });
      if (res.ok) {
        const newNotif = await res.json();
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } catch (err) {
      console.error('Failed to trigger alert:', err);
    }
  };

  const handleToggleEmergencyAlert = () => {
    setIsEmergencyAlertActive((prev) => !prev);
    if (!isEmergencyAlertActive) {
      setCurrentView('dashboard');
      handleTriggerAlert('DISPATCH', '🚨 EMERGENCY RED ALERT TRIGGERED', 'System-wide emergency override activated across all hospital units.', 'critical');
    }
  };

  return (
    <div className={`min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-red-500 selection:text-white transition-colors duration-700 relative overflow-hidden ${
      isEmergencyAlertActive ? 'ring-4 ring-red-500/50' : ''
    }`}>
      {/* Background Ambient Frosted Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        isEmergencyAlertActive={isEmergencyAlertActive}
        onToggleEmergencyAlert={handleToggleEmergencyAlert}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onTriggerAlert={handleTriggerAlert}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* View Content */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <div className="space-y-12">
            <LandingHero onNavigate={(view) => setCurrentView(view)} />
            <FeatureGrid />
            <HowItWorksTimeline />
            <LiveDemoPhone onStartFullCall={() => setCurrentView('call-simulator')} />

            {/* Bottom CTA Banner */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Ready to Deploy Next-Gen AI Dispatch?
                </h2>
                <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
                  Integrate ResqAI with municipal 911 lines and regional trauma center networks in minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => setCurrentView('call-simulator')}
                    className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
                  >
                    Test Live AI Call Simulator →
                  </button>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition"
                  >
                    Open Hospital Dashboard
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'dashboard' && (
          <HospitalDashboard
            isEmergencyAlertActive={isEmergencyAlertActive}
            onToggleEmergencyAlert={handleToggleEmergencyAlert}
            onNavigateToVision={() => setCurrentView('camera-upload')}
          />
        )}

        {currentView === 'call-simulator' && (
          <CallSimulatorView onDispatchTriggered={() => {
            setIsEmergencyAlertActive(true);
            handleTriggerAlert('DISPATCH', 'ALS Unit #409 Dispatched', 'ALS Unit #409 en route to Evergreen Terr - ETA 4 min', 'critical');
          }} />
        )}

        {currentView === 'camera-upload' && (
          <CameraUploadView />
        )}

        {currentView === 'dispatch-map' && (
          <DispatchMapView />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-white font-bold font-sans text-sm">Emergency Call Services</span>
              <p className="text-[11px] text-slate-500">ResqAI Sovereign Emergency Response Infrastructure</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <button onClick={() => setCurrentView('landing')} className="hover:text-white transition">Overview</button>
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition">Dashboard</button>
            <button onClick={() => setCurrentView('call-simulator')} className="hover:text-white transition">AI Simulator</button>
            <button onClick={() => setCurrentView('camera-upload')} className="hover:text-white transition">Injury Scan</button>
            <button onClick={() => setCurrentView('dispatch-map')} className="hover:text-white transition">Live Map</button>
            <button onClick={() => setCurrentView('admin')} className="hover:text-white transition">Admin</button>
          </div>

          <div className="text-slate-500 text-[11px] text-center md:text-right">
            © {new Date().getFullYear()} ResqAI Inc. • Powered by Gemini 2.5 Flash Triage Engine
          </div>
        </div>
      </footer>

    </div>
  );
}
