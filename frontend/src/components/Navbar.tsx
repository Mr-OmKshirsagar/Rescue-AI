import React from 'react';
import { AppView, User, NotificationItem } from '../types';
import { Activity, Radio, PhoneCall, Camera, MapPin, AlertTriangle, ShieldCheck, Settings, User as UserIcon, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isEmergencyAlertActive: boolean;
  onToggleEmergencyAlert: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id?: string) => void;
  onTriggerAlert: (type: string, title: string, message: string, severity?: 'critical' | 'warning' | 'info') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isEmergencyAlertActive,
  onToggleEmergencyAlert,
  currentUser,
  onOpenAuth,
  notifications,
  onMarkRead,
  onTriggerAlert,
}) => {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${
      isEmergencyAlertActive 
        ? 'bg-red-950/70 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
        : 'bg-black/40 border-white/10 shadow-2xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 p-0.5 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Resq<span className="text-red-500">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Emergency Voice & Dispatch Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
          {[
            { id: 'landing', label: 'Overview', icon: ShieldCheck },
            { id: 'dashboard', label: 'Hospital Dashboard', icon: Radio },
            { id: 'call-simulator', label: 'AI Voice Call', icon: PhoneCall },
            { id: 'camera-upload', label: 'Injury Vision', icon: Camera },
            { id: 'dispatch-map', label: 'Live Map', icon: MapPin },
            { id: 'admin', label: 'Admin Panel', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id as AppView)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-500/90 rounded-lg shadow-md shadow-red-500/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Action & Controls */}
        <div className="flex items-center space-x-2.5">
          
          {/* Notification Bell Component */}
          <NotificationCenter
            notifications={notifications}
            onMarkRead={onMarkRead}
            onTriggerAlert={onTriggerAlert}
          />

          {/* User Account / Auth Toggle */}
          <button
            onClick={onOpenAuth}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-medium"
            title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In to EMS Command'}
          >
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-mono">{currentUser.name.split(' ')[0]}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <LogIn className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Sign In</span>
              </div>
            )}
          </button>

          {/* Emergency Demo Alarm Button */}
          <button
            onClick={onToggleEmergencyAlert}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-300 border ${
              isEmergencyAlertActive
                ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/50 animate-bounce'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isEmergencyAlertActive ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isEmergencyAlertActive ? '🚨 MUTE' : '🚨 ALERT'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/60 bg-[#090A0F]/90 overflow-x-auto px-2">
        {[
          { id: 'landing', label: 'Home', icon: ShieldCheck },
          { id: 'dashboard', label: 'Dashboard', icon: Radio },
          { id: 'call-simulator', label: 'Call AI', icon: PhoneCall },
          { id: 'camera-upload', label: 'Vision', icon: Camera },
          { id: 'dispatch-map', label: 'Map', icon: MapPin },
          { id: 'admin', label: 'Admin', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as AppView)}
              className={`flex flex-col items-center px-2 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-red-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
