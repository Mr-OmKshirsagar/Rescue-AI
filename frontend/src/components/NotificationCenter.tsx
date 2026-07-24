import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, AlertTriangle, Radio, Hospital, CheckCircle2, Volume2, VolumeX, ShieldAlert, X, Send } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id?: string) => void;
  onTriggerAlert: (type: string, title: string, message: string, severity?: 'critical' | 'warning' | 'info') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onTriggerAlert
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto show top unread critical notification as floating toast
  useEffect(() => {
    const latestUnread = notifications.find((n) => !n.read);
    if (latestUnread && latestUnread.id !== activeToast?.id) {
      setActiveToast(latestUnread);

      // Play audio chime if enabled
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
          // Audio context fallback
        }
      }

      // Auto dismiss toast after 6 seconds
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications, soundEnabled]);

  const requestBrowserPushPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        new Notification('EMS Notification System Online', {
          body: 'Real-time ambulance dispatch & hospital alert push notifications active.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <Hospital className="w-4 h-4 text-amber-400" />;
      default:
        return <Radio className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Real-time System Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-slate-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Active Toast Banner */}
      <AnimatePresence>
        {activeToast && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full rounded-2xl bg-slate-950/95 border border-red-500/50 p-4 shadow-2xl backdrop-blur-xl flex items-start space-x-3 text-white"
          >
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">{activeToast.title}</span>
                <span className="text-[10px] text-slate-400">{activeToast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-snug">{activeToast.message}</p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl p-4 backdrop-blur-xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">System Push Alerts</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-300">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={soundEnabled ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Browser Push Notification Permission Status */}
              {pushPermission !== 'granted' && (
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-blue-200">Enable Desktop Push</p>
                    <p className="text-[10px] text-slate-400">Receive dispatch alerts when app is minimized</p>
                  </div>
                  <button
                    onClick={requestBrowserPushPermission}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Action Buttons: Mark all read & Test Triggers */}
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => onMarkRead()}
                  className="text-slate-400 hover:text-white font-mono text-[11px] underline"
                >
                  Mark all as read
                </button>
                
                <span className="text-[10px] text-slate-500 font-mono">Live Sync Active</span>
              </div>

              {/* Test Simulation Buttons */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Simulate Dispatch Push Alert</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onTriggerAlert('DISPATCH', 'ALS Ambulance Dispatched', 'ALS Unit #102 dispatched to Downtown Corridor - ETA 3 min', 'critical')}
                    className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-[11px] text-red-300 font-medium text-left transition-colors flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3 text-red-400" />
                    <span>Dispatch Alert</span>
                  </button>
                  <button
                    onClick={() => onTriggerAlert('HOSPITAL_ALERT', 'Hospital Status Divert', 'City General updated status to DIVERTING due to ICU load', 'warning')}
                    className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-[11px] text-amber-300 font-medium text-left transition-colors flex items-center space-x-1"
                  >
                    <Hospital className="w-3 h-3 text-amber-400" />
                    <span>Hospital Alert</span>
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-mono">
                    No notifications recorded.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onMarkRead(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        item.read
                          ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                          : 'bg-white/5 border-red-500/30 text-white shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(item.severity)}
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
