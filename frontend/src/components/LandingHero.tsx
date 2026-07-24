import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Play, Activity, Radio, ShieldAlert, Heart, Navigation, Clock, CheckCircle2 } from 'lucide-react';
import { AppView } from '../types';

interface LandingHeroProps {
  onNavigate: (view: AppView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Animated Subtle Grid & Radar Pulse Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column - Main Copy */}
        <motion.div 
          className="lg:col-span-7 space-y-8"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-red-400 text-xs font-mono shadow-lg shadow-red-500/10 backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold tracking-wide">AI EMERGENCY VOICE & DISPATCH PLATFORM</span>
          </motion.div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
            AI That Responds{' '}
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-amber-500 bg-clip-text text-transparent">
              Before Seconds
            </span>{' '}
            Become Lives.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl font-sans">
            An AI-powered voice emergency assistant that dispatches ambulances, performs intelligent medical triage, guides first aid, and prepares hospitals before patients arrive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('call-simulator')}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold text-base shadow-xl shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden border border-red-400/40"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <PhoneCall className="w-5 h-5 animate-pulse text-white" />
              <span>Call Emergency</span>
            </motion.button>

            {/* Secondary CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700/80 hover:border-slate-600 shadow-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Play className="w-5 h-5 text-red-400 fill-red-400" />
              <span>Watch Live Demo</span>
            </motion.button>
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
            <div>
              <div className="text-2xl font-bold text-white font-mono">0.8s</div>
              <div className="text-xs text-slate-400">Voice Response Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">99.4%</div>
              <div className="text-xs text-slate-400">Triage Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400 font-mono">3.8m</div>
              <div className="text-xs text-slate-400">Avg Ambulance Dispatch</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Floating 3D Emergency Dashboard Preview */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none perspective-1000">
            
            {/* Glow Aura */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600/40 via-amber-500/20 to-red-600/40 rounded-3xl blur-2xl opacity-60 animate-pulse" />

            {/* Main Glassmorphism Dashboard Preview Card */}
            <div className="relative rounded-3xl bg-black/40 border border-white/10 p-6 shadow-2xl backdrop-blur-md space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase">
                    ACTIVE INCIDENT #8492
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-mono font-bold uppercase">
                  CRITICAL - TIER 1
                </span>
              </div>

              {/* Patient Quick Vitals */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Patient Triage</p>
                  <h4 className="text-sm font-bold text-white mt-0.5">Robert Vance, 64M</h4>
                  <p className="text-xs text-red-400 mt-0.5">Staircase Fall Trauma (Suspected Fracture)</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-emerald-400 animate-pulse" />
                    <span>88 BPM</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Vitals Stable</span>
                </div>
              </div>

              {/* Floating ETA Live Tracker Badge */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="bg-gradient-to-r from-red-950/80 to-slate-900/90 p-4 rounded-2xl border border-red-500/30 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                    <Navigation className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-300 font-medium">ALS Unit #409 En Route</div>
                    <div className="text-xs text-slate-400 font-mono">Speed: 48 mph • 2.4 mi away</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-400 font-mono">04:12</div>
                  <div className="text-[10px] text-slate-400 uppercase">Live ETA</div>
                </div>
              </motion.div>

              {/* Hospital Pre-Arrival Live Status */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Metro Trauma Center Bay #3</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">PRE-NOTIFIED</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-4/5 animate-pulse" />
                </div>
              </div>

              {/* AI Transcript snippet preview */}
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
                <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="italic text-slate-400">
                  "AI: Dispatching ambulance #409 now. Keep patient stationary. Hospital trauma bay is alerted."
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
