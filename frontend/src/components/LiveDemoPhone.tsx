import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, Mic, Volume2, ShieldAlert, CheckCircle, Radio, Sparkles, AlertCircle } from 'lucide-react';

interface LiveDemoPhoneProps {
  onStartFullCall?: () => void;
}

export const LiveDemoPhone: React.FC<LiveDemoPhoneProps> = ({ onStartFullCall }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const dialog = [
    { speaker: 'AI', text: 'Hello, this is ResqAI Emergency Dispatcher. Do you need an ambulance right now?', delay: 0 },
    { speaker: 'Caller', text: 'Yes, please hurry!', delay: 1500 },
    { speaker: 'AI', text: 'What happened? Please describe the emergency.', delay: 3000 },
    { speaker: 'Caller', text: 'My father fell from the stairs. He cannot move his left leg and is in severe pain.', delay: 4800 },
    { speaker: 'AI', text: 'I am dispatching an Advanced Life Support ambulance now. ALS Unit #409 is en route (ETA 4 mins). Please keep him stationary.', delay: 7200 }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % dialog.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, dialog.length]);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
          REAL-TIME VOICE SIMULATION
        </h2>
        <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          See ResqAI Live Call Execution
        </h3>
        <p className="text-slate-400 text-base sm:text-lg">
          Natural speech recognition combined with automated clinical triage & sub-second ambulance dispatch.
        </p>
      </div>

      {/* Grid: Left Phone UI, Right Conversation Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        
        {/* Left Column: Phone UI Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          
          <div className="w-full max-w-xs rounded-[40px] bg-slate-900 border-4 border-slate-800 p-6 shadow-2xl shadow-red-500/10 relative overflow-hidden flex flex-col items-center justify-between min-h-[480px]">
            
            {/* Phone Top Notch */}
            <div className="w-28 h-4 bg-slate-950 rounded-b-2xl mb-6 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800 mr-2" />
              <div className="w-8 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Calling Status Indicator */}
            <div className="flex flex-col items-center space-y-3 my-auto">
              
              {/* Pulsing Avatar Circle */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center p-1 shadow-2xl shadow-red-500/40">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <PhoneCall className="w-10 h-10 text-red-500 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-white font-sans">911 Emergency Line</div>
                <div className="text-xs font-mono text-red-400 flex items-center justify-center space-x-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>ResqAI Voice Protocol • 00:24</span>
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-center space-x-1 h-12 w-full px-8">
                {[40, 75, 20, 90, 50, 100, 30, 85, 60, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPlaying ? [`${h}%`, `${Math.max(15, (h * 1.5) % 100)}%`, `${h}%`] : '20%' }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                    className="w-1.5 bg-red-500/80 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Phone Control Buttons */}
            <div className="w-full grid grid-cols-3 gap-3 pt-6 border-t border-slate-800">
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition">
                <Mic className="w-5 h-5 text-red-400" />
                <span className="text-[10px] mt-1 font-mono">Mute</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition">
                <Volume2 className="w-5 h-5 text-red-400" />
                <span className="text-[10px] mt-1 font-mono">Speaker</span>
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-600 text-white hover:bg-red-500 transition shadow-lg shadow-red-600/30"
              >
                <PhoneCall className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-mono">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Conversation Transcript */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-red-400 animate-spin-slow" />
              <h4 className="text-lg font-bold text-white font-sans">Live Triage Transcript</h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono">
              Confidence: 99.2%
            </span>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4 min-h-[320px] flex flex-col justify-center">
            {dialog.slice(0, activeStep + 1).map((msg, index) => {
              const isAI = msg.speaker === 'AI';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-md rounded-2xl p-4 shadow-lg border ${
                      isAI
                        ? 'bg-slate-900 border-slate-700/80 text-slate-100 rounded-tl-sm'
                        : 'bg-red-950/80 border-red-500/40 text-red-100 rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-slate-400">
                      <span className={isAI ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isAI ? '🤖 ResqAI Dispatcher' : '👤 Caller (Victim Son)'}
                      </span>
                      <span>21:28:{(10 + index * 4).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Trigger Banner */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ALS Ambulance #409 Auto-Dispatched</span>
            </div>
            {onStartFullCall && (
              <button
                onClick={onStartFullCall}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition"
              >
                Launch Interactive Call →
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
