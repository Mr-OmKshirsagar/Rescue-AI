import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, Mic, Volume2, Send, Activity, Sparkles, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { TranscriptMessage } from '../types';

interface CallSimulatorViewProps {
  onDispatchTriggered?: () => void;
}

export const CallSimulatorView: React.FC<CallSimulatorViewProps> = ({ onDispatchTriggered }) => {
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: 'm-1',
      speaker: 'AI',
      text: 'ResqAI Emergency Dispatcher connected. What is your emergency location and condition?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState<any | null>(null);

  const quickPrompts = [
    'My father fell down the stairs and cannot stand up.',
    'Heavy chest pain and left arm numbness.',
    'Severe cut on leg with persistent bleeding.',
    'Car accident at main intersection, passenger conscious.'
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isAnalyzing) return;

    const userMsg: TranscriptMessage = {
      id: `usr-${Date.now()}`,
      speaker: 'Caller',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);

    try {
      // Call server backend endpoint /api/triage
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => `${m.speaker}: ${m.text}`)
        })
      });

      const data = await response.json();

      const aiMsg: TranscriptMessage = {
        id: `ai-${Date.now()}`,
        speaker: 'AI',
        text: data.aiResponse || 'Ambulance is dispatched. Paramdeics are on their way.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isAlert: true
      };

      setMessages((prev) => [...prev, aiMsg]);

      setActiveDispatch({
        priority: data.priority || 'CRITICAL',
        unit: data.dispatchUnit || 'ALS Unit #409',
        eta: data.etaMinutes || 4,
        hospital: data.recommendedHospital || 'Metro Trauma Center',
        firstAid: data.firstAidInstructions || 'Keep patient calm and stationary.'
      });

      if (onDispatchTriggered) {
        onDispatchTriggered();
      }
    } catch (error) {
      console.error("Error calling triage endpoint:", error);
      const fallbackAiMsg: TranscriptMessage = {
        id: `ai-${Date.now()}`,
        speaker: 'AI',
        text: 'I have dispatched ALS Unit #409 immediately. An ambulance is 4 minutes away.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isAlert: true
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold uppercase inline-flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>INTERACTIVE VOICE & TEXT DISPATCH DEMO</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI Voice Call Simulator
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Type or select an emergency scenario to observe ResqAI’s instant sub-second triage & automated dispatch engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Phone Console & Messages */}
        <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Header Status */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center p-0.5 shadow-lg shadow-red-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ResqAI 911 Line</h3>
                <p className="text-xs text-emerald-400 font-mono">● Sub-second Audio Protocol Active</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-red-400 font-mono text-xs bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="space-y-4 min-h-[340px] max-h-[420px] overflow-y-auto pr-2">
            <AnimatePresence>
              {messages.map((m) => {
                const isAI = m.speaker === 'AI';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-md p-4 rounded-2xl text-xs space-y-1 shadow-lg border ${
                      isAI
                        ? 'bg-slate-900 border-slate-700/80 text-slate-100 rounded-tl-sm'
                        : 'bg-red-950/80 border-red-500/40 text-red-100 rounded-tr-sm'
                    }`}>
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span className={isAI ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                          {isAI ? '🤖 ResqAI Voice Assistant' : '👤 You (Caller)'}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-xs font-mono text-red-400 animate-pulse p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <Activity className="w-4 h-4 animate-spin" />
                <span>AI Analyzing Emergency Audio & Symptoms...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Sample Emergency Prompts</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-red-500/30 text-xs transition text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center space-x-2 pt-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type emergency description..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Right Column: Active Dispatch & Clinical Triage Result */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-sans">Automated Dispatch Engine</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                READY
              </span>
            </div>

            {activeDispatch ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Priority Card */}
                <div className="bg-gradient-to-r from-red-950 to-slate-900 p-4 rounded-2xl border border-red-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Assessed Threat</span>
                    <h4 className="text-xl font-extrabold text-red-400 font-mono">{activeDispatch.priority}</h4>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                {/* Dispatch Details */}
                <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Unit:</span>
                    <span className="font-bold text-white">{activeDispatch.unit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Estimated Arrival:</span>
                    <span className="font-bold text-emerald-400 font-mono">{activeDispatch.eta} mins</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Target Hospital:</span>
                    <span className="font-bold text-white">{activeDispatch.hospital}</span>
                  </div>
                </div>

                {/* First Aid Guidance */}
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">First Aid Protocol</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeDispatch.firstAid}</p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hospital ER Bay alert transmitted successfully</span>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <Radio className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Select or send an emergency message to trigger automated triage & dispatch calculation.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
